use anyhow::{bail, Context, Result};
use clap::Parser;
use image::{ImageFormat, ImageReader};
use regex::Regex;
use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Parser)]
#[command(name = "postimg")]
#[command(about = "Convert images referenced by one Hugo post to WebP")]
struct Cli {
    post: PathBuf,

    #[arg(long)]
    rewrite: bool,

    #[arg(long)]
    delete_original: bool,

    #[arg(long)]
    dry_run: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
struct ImageRef {
    original_path: String,
    resolved_source: PathBuf,
    target_webp: PathBuf,
    rewritten_path: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum ConversionOutcome {
    Converted,
    SkippedExisting,
    SkippedUnsupported,
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    run(cli)
}

fn run(cli: Cli) -> Result<()> {
    if cli.delete_original && !cli.rewrite {
        bail!("--delete-original requires --rewrite");
    }

    let repo_root = find_repo_root(&cli.post)?;
    let post_path = fs::canonicalize(&cli.post)
        .with_context(|| format!("failed to canonicalize post path {}", cli.post.display()))?;
    let markdown = fs::read_to_string(&post_path)
        .with_context(|| format!("failed to read post {}", post_path.display()))?;

    let refs = collect_image_refs(&markdown, &post_path, &repo_root)?;
    if refs.is_empty() {
        println!(
            "No local PNG/JPG/JPEG images found in {}",
            post_path.display()
        );
        return Ok(());
    }

    println!(
        "Found {} local image reference(s) in {}",
        refs.len(),
        post_path.display()
    );

    let mut converted = 0usize;
    let mut skipped_existing = 0usize;
    let mut skipped_unsupported = 0usize;
    let mut rewritten_refs = Vec::new();
    for image_ref in &refs {
        match process_image(image_ref, cli.dry_run)? {
            ConversionOutcome::Converted => {
                converted += 1;
                rewritten_refs.push(image_ref.clone());
            }
            ConversionOutcome::SkippedExisting => {
                skipped_existing += 1;
                rewritten_refs.push(image_ref.clone());
            }
            ConversionOutcome::SkippedUnsupported => skipped_unsupported += 1,
        }
    }

    let rewritten = if cli.rewrite {
        rewrite_markdown(&post_path, &markdown, &rewritten_refs, cli.dry_run)?
    } else {
        0
    };

    let deleted = if cli.delete_original {
        delete_originals(&rewritten_refs, cli.dry_run)?
    } else {
        0
    };

    println!(
        "Summary: converted={}, skipped_existing={}, skipped_unsupported={}, rewrites={}, deleted_originals={}",
        converted, skipped_existing, skipped_unsupported, rewritten, deleted
    );

    Ok(())
}

fn find_repo_root(start: &Path) -> Result<PathBuf> {
    let mut current = if start.is_dir() {
        start.to_path_buf()
    } else {
        start
            .parent()
            .map(Path::to_path_buf)
            .context("post path has no parent directory")?
    };

    loop {
        if current.join("content").is_dir() && current.join("static").is_dir() {
            return Ok(current);
        }
        if !current.pop() {
            bail!("failed to locate repo root from {}", start.display());
        }
    }
}

fn collect_image_refs(markdown: &str, post_path: &Path, repo_root: &Path) -> Result<Vec<ImageRef>> {
    let markdown_re = Regex::new(r#"!\[[^\]]*\]\((?P<path>[^)]+)\)"#)?;
    let html_re = Regex::new(r#"<img[^>]+src=[\"'](?P<path>[^\"']+)[\"']"#)?;
    let mut refs = BTreeMap::new();

    for captures in markdown_re
        .captures_iter(markdown)
        .chain(html_re.captures_iter(markdown))
    {
        let Some(raw) = captures.name("path") else {
            continue;
        };
        let original = raw.as_str().trim().to_string();
        if should_skip_path(&original) || !is_supported_image_path(&original) {
            continue;
        }

        let decoded = decode_path(&original)?;
        let resolved = resolve_source_path(&decoded, post_path, repo_root)?;
        if !resolved.is_file() {
            bail!(
                "image path {} resolved to missing file {}",
                original,
                resolved.display()
            );
        }

        let target_webp = resolved.with_extension("webp");
        let rewritten_path = replace_extension(&original, "webp")?;

        refs.entry(original.clone()).or_insert(ImageRef {
            original_path: original,
            resolved_source: resolved,
            target_webp,
            rewritten_path,
        });
    }

    Ok(refs.into_values().collect())
}

fn should_skip_path(path: &str) -> bool {
    let lowered = path.to_ascii_lowercase();
    lowered.starts_with("http://")
        || lowered.starts_with("https://")
        || lowered.starts_with("data:")
        || lowered.starts_with("//")
}

fn is_supported_image_path(path: &str) -> bool {
    let lowered = path.to_ascii_lowercase();
    lowered.ends_with(".png") || lowered.ends_with(".jpg") || lowered.ends_with(".jpeg")
}

fn decode_path(path: &str) -> Result<String> {
    urlencoding::decode(path)
        .map(|value| value.into_owned())
        .with_context(|| format!("failed to decode image path {path}"))
}

fn resolve_source_path(decoded_path: &str, post_path: &Path, repo_root: &Path) -> Result<PathBuf> {
    if let Some(stripped) = decoded_path.strip_prefix("/img/") {
        return Ok(repo_root.join("static").join("img").join(stripped));
    }
    if let Some(stripped) = decoded_path.strip_prefix('/') {
        return Ok(repo_root.join("static").join(stripped));
    }

    let parent = post_path
        .parent()
        .context("post path has no parent directory for relative resolution")?;
    Ok(parent.join(decoded_path))
}

fn replace_extension(path: &str, new_ext: &str) -> Result<String> {
    let as_path = Path::new(path);
    let stem = as_path
        .file_stem()
        .and_then(|value| value.to_str())
        .with_context(|| format!("path {} has invalid filename", path))?;

    let mut replaced = match as_path.parent() {
        Some(parent) if !parent.as_os_str().is_empty() => parent.join(format!("{stem}.{new_ext}")),
        _ => PathBuf::from(format!("{stem}.{new_ext}")),
    };

    if path.starts_with('/') {
        replaced = Path::new("/").join(replaced);
    }

    Ok(replaced.to_string_lossy().replace('\\', "/"))
}

fn process_image(image_ref: &ImageRef, dry_run: bool) -> Result<ConversionOutcome> {
    if is_valid_generated_webp(&image_ref.target_webp)? {
        println!(
            "SKIP existing {} -> {}",
            image_ref.resolved_source.display(),
            image_ref.target_webp.display()
        );
        return Ok(ConversionOutcome::SkippedExisting);
    }

    cleanup_invalid_generated_webp(&image_ref.target_webp)?;

    println!(
        "CONVERT {} -> {}",
        image_ref.resolved_source.display(),
        image_ref.target_webp.display()
    );

    if dry_run {
        return Ok(ConversionOutcome::Converted);
    }

    let img = ImageReader::open(&image_ref.resolved_source)
        .with_context(|| {
            format!(
                "failed to open source image {}",
                image_ref.resolved_source.display()
            )
        })?
        .with_guessed_format()
        .with_context(|| {
            format!(
                "failed to guess image format for {}",
                image_ref.resolved_source.display()
            )
        })?
        .decode()
        .with_context(|| {
            format!(
                "failed to decode source image {}",
                image_ref.resolved_source.display()
            )
        })?;

    let temp_target = temporary_webp_path(&image_ref.target_webp)?;
    match img.save_with_format(&temp_target, ImageFormat::WebP) {
        Ok(()) => {
            fs::rename(&temp_target, &image_ref.target_webp).with_context(|| {
                format!(
                    "failed to move generated webp {} into place {}",
                    temp_target.display(),
                    image_ref.target_webp.display()
                )
            })?;
            Ok(ConversionOutcome::Converted)
        }
        Err(err) => {
            let _ = fs::remove_file(&temp_target);
            let _ = fs::remove_file(&image_ref.target_webp);
            println!(
                "SKIP unsupported {} -> {} ({err})",
                image_ref.resolved_source.display(),
                image_ref.target_webp.display()
            );
            Ok(ConversionOutcome::SkippedUnsupported)
        }
    }
}

fn is_valid_generated_webp(path: &Path) -> Result<bool> {
    if !path.exists() {
        return Ok(false);
    }

    let metadata = fs::metadata(path)
        .with_context(|| format!("failed to stat generated webp {}", path.display()))?;
    Ok(metadata.len() > 0)
}

fn cleanup_invalid_generated_webp(path: &Path) -> Result<()> {
    if !path.exists() {
        return Ok(());
    }

    let metadata = fs::metadata(path)
        .with_context(|| format!("failed to stat generated webp {}", path.display()))?;
    if metadata.len() == 0 {
        fs::remove_file(path)
            .with_context(|| format!("failed to remove invalid webp {}", path.display()))?;
    }
    Ok(())
}

fn temporary_webp_path(target: &Path) -> Result<PathBuf> {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .context("system clock before UNIX_EPOCH")?
        .as_nanos();
    let file_name = target
        .file_name()
        .and_then(|value| value.to_str())
        .with_context(|| format!("invalid target filename {}", target.display()))?;
    Ok(target.with_file_name(format!(".{file_name}.{nanos}.tmp")))
}

fn rewrite_markdown(
    post_path: &Path,
    original_markdown: &str,
    refs: &[ImageRef],
    dry_run: bool,
) -> Result<usize> {
    let mut rewritten = original_markdown.to_string();
    let mut rewrites = 0usize;

    for image_ref in refs {
        if rewritten.contains(&image_ref.original_path) {
            rewritten = rewritten.replace(&image_ref.original_path, &image_ref.rewritten_path);
            rewrites += 1;
            println!(
                "REWRITE {} -> {}",
                image_ref.original_path, image_ref.rewritten_path
            );
        }
    }

    if rewrites == 0 {
        println!("No markdown references needed rewriting");
        return Ok(0);
    }

    if dry_run {
        return Ok(rewrites);
    }

    fs::write(post_path, rewritten)
        .with_context(|| format!("failed to rewrite markdown file {}", post_path.display()))?;
    Ok(rewrites)
}

fn delete_originals(refs: &[ImageRef], dry_run: bool) -> Result<usize> {
    let mut deleted = 0usize;

    for image_ref in refs {
        if !image_ref.resolved_source.exists() {
            continue;
        }

        if !dry_run && !image_ref.target_webp.exists() {
            bail!(
                "refusing to delete {} because {} does not exist",
                image_ref.resolved_source.display(),
                image_ref.target_webp.display()
            );
        }

        println!("DELETE {}", image_ref.resolved_source.display());
        deleted += 1;

        if dry_run {
            continue;
        }

        fs::remove_file(&image_ref.resolved_source).with_context(|| {
            format!(
                "failed to delete original image {}",
                image_ref.resolved_source.display()
            )
        })?;
    }

    Ok(deleted)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn collects_absolute_and_relative_images() {
        let fixture = TempDir::new().unwrap();
        let repo = fixture.path();
        fs::create_dir_all(repo.join("content/posts/sub")).unwrap();
        fs::create_dir_all(repo.join("static/img/demo")).unwrap();
        fs::write(repo.join("static/img/demo/a.png"), b"png").unwrap();
        fs::write(repo.join("content/posts/sub/local.jpg"), b"jpg").unwrap();
        let post = repo.join("content/posts/sub/post.md");
        fs::write(&post, "![a](/img/demo/a.png)\n<img src=\"local.jpg\">\n").unwrap();

        let refs = collect_image_refs(&fs::read_to_string(&post).unwrap(), &post, repo).unwrap();

        assert_eq!(refs.len(), 2);
        assert_eq!(refs[0].rewritten_path, "/img/demo/a.webp");
        assert_eq!(refs[1].rewritten_path, "local.webp");
    }

    #[test]
    fn skips_remote_and_webp_images() {
        let fixture = TempDir::new().unwrap();
        let repo = fixture.path();
        fs::create_dir_all(repo.join("content/posts")).unwrap();
        fs::create_dir_all(repo.join("static")).unwrap();
        let post = repo.join("content/posts/post.md");
        fs::write(
            &post,
            "![remote](https://example.com/a.png)\n![done](/img/a.webp)\n",
        )
        .unwrap();

        let refs = collect_image_refs(&fs::read_to_string(&post).unwrap(), &post, repo).unwrap();

        assert!(refs.is_empty());
    }

    #[test]
    fn replace_extension_preserves_leading_slash() {
        let replaced = replace_extension("/img/demo/file.name.png", "webp").unwrap();
        assert_eq!(replaced, "/img/demo/file.name.webp");
    }

    #[test]
    fn delete_originals_requires_generated_webp() {
        let fixture = TempDir::new().unwrap();
        let original = fixture.path().join("a.png");
        let target = fixture.path().join("a.webp");
        fs::write(&original, b"png").unwrap();

        let refs = vec![ImageRef {
            original_path: "/img/a.png".to_string(),
            resolved_source: original,
            target_webp: target,
            rewritten_path: "/img/a.webp".to_string(),
        }];

        let error = delete_originals(&refs, false).unwrap_err().to_string();
        assert!(error.contains("refusing to delete"));
    }

    #[test]
    fn rewrite_then_delete_removes_original_file() {
        let fixture = TempDir::new().unwrap();
        let repo = fixture.path();
        fs::create_dir_all(repo.join("content/posts")).unwrap();
        fs::create_dir_all(repo.join("static/img/demo")).unwrap();

        let original = repo.join("static/img/demo/a.png");
        let webp = repo.join("static/img/demo/a.webp");
        let post = repo.join("content/posts/post.md");

        fs::write(&original, b"png").unwrap();
        fs::write(&webp, b"webp").unwrap();
        fs::write(&post, "![a](/img/demo/a.png)\n").unwrap();

        let refs = collect_image_refs(&fs::read_to_string(&post).unwrap(), &post, repo).unwrap();
        let rewrites =
            rewrite_markdown(&post, &fs::read_to_string(&post).unwrap(), &refs, false).unwrap();
        let deleted = delete_originals(&refs, false).unwrap();

        assert_eq!(rewrites, 1);
        assert_eq!(deleted, 1);
        assert!(!original.exists());
        let updated = fs::read_to_string(&post).unwrap();
        assert!(updated.contains("/img/demo/a.webp"));
    }

    #[test]
    fn delete_original_requires_rewrite_flag() {
        let fixture = TempDir::new().unwrap();
        let repo = fixture.path();
        fs::create_dir_all(repo.join("content/posts")).unwrap();
        fs::create_dir_all(repo.join("static/img/demo")).unwrap();
        let original = repo.join("static/img/demo/a.png");
        let post = repo.join("content/posts/post.md");

        fs::write(&original, b"png").unwrap();
        fs::write(&post, "![a](/img/demo/a.png)\n").unwrap();

        let error = run(Cli {
            post,
            rewrite: false,
            delete_original: true,
            dry_run: true,
        })
        .unwrap_err()
        .to_string();

        assert!(error.contains("--delete-original requires --rewrite"));
    }

    #[test]
    fn process_image_uses_guessed_format_for_mislabeled_jpeg() {
        let fixture = TempDir::new().unwrap();
        let source = fixture.path().join("mislabeled.png");
        let target = fixture.path().join("mislabeled.webp");

        let img = image::DynamicImage::new_rgb8(2, 2);
        img.save_with_format(&source, ImageFormat::Jpeg).unwrap();

        let image_ref = ImageRef {
            original_path: "/img/demo/mislabeled.png".to_string(),
            resolved_source: source.clone(),
            target_webp: target.clone(),
            rewritten_path: "/img/demo/mislabeled.webp".to_string(),
        };

        let outcome = process_image(&image_ref, false).unwrap();
        assert_eq!(outcome, ConversionOutcome::Converted);
        assert!(target.exists());
    }

    #[test]
    fn process_image_skips_unsupported_webp_encoding() {
        let fixture = TempDir::new().unwrap();
        let source = fixture.path().join("too-wide.png");
        let target = fixture.path().join("too-wide.webp");

        let img = image::DynamicImage::new_rgba8(24_045, 259);
        img.save_with_format(&source, ImageFormat::Png).unwrap();

        let image_ref = ImageRef {
            original_path: "/img/demo/too-wide.png".to_string(),
            resolved_source: source.clone(),
            target_webp: target.clone(),
            rewritten_path: "/img/demo/too-wide.webp".to_string(),
        };

        let outcome = process_image(&image_ref, false).unwrap();
        assert_eq!(outcome, ConversionOutcome::SkippedUnsupported);
        assert!(!target.exists());
    }
}
