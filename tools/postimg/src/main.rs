use anyhow::{bail, Context, Result};
use clap::{Parser, Subcommand};
use image::{ImageFormat, ImageReader};
use regex::Regex;
use std::collections::{BTreeMap, BTreeSet};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

// ─── CLI ────────────────────────────────────────────────────────────────────

#[derive(Debug, Parser)]
#[command(name = "postimg")]
#[command(about = "Hugo blog image toolkit: convert & clean")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Debug, Subcommand)]
enum Commands {
    /// Convert images referenced by one Hugo post to WebP
    Convert {
        /// Path to the markdown post file
        post: PathBuf,

        /// Rewrite image references in the markdown file to .webp
        #[arg(long)]
        rewrite: bool,

        /// Delete original image files after successful conversion (requires --rewrite)
        #[arg(long)]
        delete_original: bool,

        /// Show what would be done without making changes
        #[arg(long)]
        dry_run: bool,
    },
    /// Scan a directory (recursively) for unreferenced images and optionally delete them
    Clean {
        /// Root directory of the Hugo repository (must contain content/ and static/)
        #[arg(default_value = ".")]
        repo: PathBuf,

        /// Image directories to scan, relative to repo root (can specify multiple)
        #[arg(long = "image-dir", default_values_t = vec!["static/img".to_string()])]
        image_dirs: Vec<String>,

        /// Additional content directories to scan for references (can specify multiple)
        #[arg(long = "content-dir", default_values_t = vec!["content".to_string()])]
        content_dirs: Vec<String>,

        /// Also scan these directories for image references (e.g. layouts, assets)
        #[arg(long = "extra-ref-dir")]
        extra_ref_dirs: Vec<String>,

        /// Actually delete unreferenced images (default: dry-run / list only)
        #[arg(long)]
        delete: bool,

        /// Glob patterns for files to never delete (e.g. "favicon-*.png")
        #[arg(long = "keep", default_values_t = vec![
            "favicon-*.png".to_string(),
            "favicon.ico".to_string(),
            "apple-touch-icon*.png".to_string(),
        ])]
        keep_patterns: Vec<String>,
    },
}

// ─── Entry ──────────────────────────────────────────────────────────────────

fn main() -> Result<()> {
    let cli = Cli::parse();
    match cli.command {
        Commands::Convert {
            post,
            rewrite,
            delete_original,
            dry_run,
        } => run_convert(post, rewrite, delete_original, dry_run),
        Commands::Clean {
            repo,
            image_dirs,
            content_dirs,
            extra_ref_dirs,
            delete,
            keep_patterns,
        } => run_clean(repo, image_dirs, content_dirs, extra_ref_dirs, delete, keep_patterns),
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//  CLEAN  subcommand
// ═══════════════════════════════════════════════════════════════════════════

/// Image extensions we consider when scanning the image directories.
const IMAGE_EXTENSIONS: &[&str] = &[
    "png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico", "avif",
];

/// Text file extensions we scan for image references.
const TEXT_EXTENSIONS: &[&str] = &[
    "md", "html", "htm", "xml", "toml", "yaml", "yml", "json", "css", "js", "ts", "scss",
];

fn run_clean(
    repo: PathBuf,
    image_dirs: Vec<String>,
    content_dirs: Vec<String>,
    extra_ref_dirs: Vec<String>,
    delete: bool,
    keep_patterns: Vec<String>,
) -> Result<()> {
    let repo = fs::canonicalize(&repo)
        .with_context(|| format!("failed to canonicalize repo path {}", repo.display()))?;

    // 1. Collect all image files on disk
    let mut all_images: BTreeSet<PathBuf> = BTreeSet::new();
    for dir in &image_dirs {
        let abs_dir = repo.join(dir);
        if !abs_dir.is_dir() {
            eprintln!("WARN: image directory {} does not exist, skipping", abs_dir.display());
            continue;
        }
        collect_image_files(&abs_dir, &mut all_images)?;
    }

    if all_images.is_empty() {
        println!("No image files found in the specified image directories.");
        return Ok(());
    }
    println!("Found {} image file(s) on disk.", all_images.len());

    // 2. Collect all text references to images
    let mut ref_dirs: Vec<String> = Vec::new();
    ref_dirs.extend(content_dirs);
    ref_dirs.extend(extra_ref_dirs);

    // Also scan image_dirs themselves (some HTML/JS might live there)
    // and common Hugo directories
    for extra in &["layouts", "assets", "config", "themes"] {
        let p = repo.join(extra);
        if p.is_dir() {
            ref_dirs.push(extra.to_string());
        }
    }

    let mut referenced_stems: BTreeSet<String> = BTreeSet::new();
    for dir in &ref_dirs {
        let abs_dir = repo.join(dir);
        if !abs_dir.is_dir() {
            continue;
        }
        collect_references_from_dir(&abs_dir, &repo, &mut referenced_stems)?;
    }

    // Also scan image_dirs for references (in case there are HTML files inside)
    for dir in &image_dirs {
        let abs_dir = repo.join(dir);
        if abs_dir.is_dir() {
            collect_references_from_dir(&abs_dir, &repo, &mut referenced_stems)?;
        }
    }

    println!("Found {} unique image reference(s) in text files.", referenced_stems.len());

    // 3. Build the protected-patterns matcher
    let keep_matchers: Vec<glob::Pattern> = keep_patterns
        .iter()
        .filter_map(|p| {
            glob::Pattern::new(p)
                .map_err(|e| eprintln!("WARN: invalid keep pattern '{}': {}", p, e))
                .ok()
        })
        .collect();

    // 4. Determine which images are unreferenced
    let mut orphans: Vec<PathBuf> = Vec::new();
    let mut kept_protected = 0usize;

    for image_path in &all_images {
        let file_name = image_path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("");

        // Check keep patterns
        if keep_matchers.iter().any(|m| m.matches(file_name)) {
            kept_protected += 1;
            continue;
        }

        // Check if referenced: we try multiple matching strategies
        if is_image_referenced(image_path, &repo, &referenced_stems) {
            continue;
        }

        orphans.push(image_path.clone());
    }

    // 5. Report
    let total_images = all_images.len();
    let referenced_count = total_images - orphans.len() - kept_protected;

    println!();
    println!("=== Clean Summary ===");
    println!("Total images on disk:    {}", total_images);
    println!("Referenced (in use):     {}", referenced_count);
    println!("Protected (keep rules):  {}", kept_protected);
    println!("Unreferenced (orphans):  {}", orphans.len());

    if orphans.is_empty() {
        println!("\nAll images are referenced or protected. Nothing to clean.");
        return Ok(());
    }

    // Calculate total size
    let total_bytes: u64 = orphans
        .iter()
        .filter_map(|p| fs::metadata(p).ok().map(|m| m.len()))
        .sum();

    println!(
        "Orphan total size:       {} KB ({:.1} MB)",
        total_bytes / 1024,
        total_bytes as f64 / 1024.0 / 1024.0
    );
    println!();

    // List orphans
    for orphan in &orphans {
        let rel = orphan
            .strip_prefix(&repo)
            .unwrap_or(orphan)
            .display();
        let size_kb = fs::metadata(orphan).map(|m| m.len() / 1024).unwrap_or(0);
        if delete {
            println!("DELETE: {} ({}KB)", rel, size_kb);
        } else {
            println!("ORPHAN: {} ({}KB)", rel, size_kb);
        }
    }

    // 6. Delete if requested
    if delete {
        let mut deleted = 0usize;
        let mut delete_errors = 0usize;
        for orphan in &orphans {
            match fs::remove_file(orphan) {
                Ok(()) => deleted += 1,
                Err(e) => {
                    eprintln!(
                        "ERROR: failed to delete {}: {}",
                        orphan.display(),
                        e
                    );
                    delete_errors += 1;
                }
            }
        }
        println!(
            "\nDeleted {} file(s), {} error(s), freed ~{} KB",
            deleted,
            delete_errors,
            total_bytes / 1024
        );
    } else {
        println!(
            "\nDry run: no files deleted. Use --delete to remove these {} orphan(s).",
            orphans.len()
        );
    }

    Ok(())
}

/// Recursively collect all image files under `dir`.
fn collect_image_files(dir: &Path, out: &mut BTreeSet<PathBuf>) -> Result<()> {
    for entry in fs::read_dir(dir)
        .with_context(|| format!("failed to read directory {}", dir.display()))?
    {
        let entry = entry?;
        let path = entry.path();
        if path.is_dir() {
            collect_image_files(&path, out)?;
        } else if path.is_file() {
            if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
                if IMAGE_EXTENSIONS.contains(&ext.to_ascii_lowercase().as_str()) {
                    out.insert(fs::canonicalize(&path)?);
                }
            }
        }
    }
    Ok(())
}

/// Recursively scan text files under `dir`, extracting anything that looks like
/// an image filename reference. We store decoded filenames (without directory)
/// and also full relative paths.
fn collect_references_from_dir(
    dir: &Path,
    repo_root: &Path,
    out: &mut BTreeSet<String>,
) -> Result<()> {
    for entry in fs::read_dir(dir)
        .with_context(|| format!("failed to read directory {}", dir.display()))?
    {
        let entry = entry?;
        let path = entry.path();
        if path.is_dir() {
            // Skip hidden dirs and node_modules
            let name = path.file_name().and_then(|n| n.to_str()).unwrap_or("");
            if name.starts_with('.') || name == "node_modules" || name == "public" {
                continue;
            }
            collect_references_from_dir(&path, repo_root, out)?;
        } else if path.is_file() {
            if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
                if TEXT_EXTENSIONS.contains(&ext.to_ascii_lowercase().as_str()) {
                    extract_image_refs_from_file(&path, repo_root, out)?;
                }
            }
        }
    }
    Ok(())
}

/// Extract image references from a single text file.
/// We use multiple strategies to catch as many references as possible:
///   - Markdown: `![...](path)`
///   - HTML: `<img ... src="path">`
///   - HTML: `src="path"`, `href="path"` (general)
///   - Hugo: `resources`, `featureimage`, `image`, `cover` front-matter keys
///   - CSS: `url(path)`
///   - Plain filename matches
fn extract_image_refs_from_file(
    path: &Path,
    repo_root: &Path,
    out: &mut BTreeSet<String>,
) -> Result<()> {
    let content = match fs::read_to_string(path) {
        Ok(c) => c,
        Err(_) => return Ok(()), // skip binary files
    };

    // Strategy 1: Markdown image syntax  ![alt](path)
    let md_re = Regex::new(r#"!\[[^\]]*\]\((?P<path>[^)\s]+)"#)?;
    for cap in md_re.captures_iter(&content) {
        if let Some(m) = cap.name("path") {
            add_ref(m.as_str(), repo_root, out);
        }
    }

    // Strategy 2: HTML src/href attributes
    let attr_re = Regex::new(r#"(?:src|href|url|image|featureimage|featureImage|cover)\s*[:=]\s*["']?(?P<path>[^"'\s)>]+)"#)?;
    for cap in attr_re.captures_iter(&content) {
        if let Some(m) = cap.name("path") {
            add_ref(m.as_str(), repo_root, out);
        }
    }

    // Strategy 3: CSS url()
    let css_re = Regex::new(r#"url\(\s*["']?(?P<path>[^"')]+)"#)?;
    for cap in css_re.captures_iter(&content) {
        if let Some(m) = cap.name("path") {
            add_ref(m.as_str(), repo_root, out);
        }
    }

    // Strategy 4: Hugo front-matter style — key: "value" or key = "value"
    // This catches TOML/YAML image paths
    let frontmatter_re = Regex::new(r#"(?:image|cover|thumbnail|banner|featureimage|featureImage|src)\s*[:=]\s*["'](?P<path>[^"']+)"#)?;
    for cap in frontmatter_re.captures_iter(&content) {
        if let Some(m) = cap.name("path") {
            add_ref(m.as_str(), repo_root, out);
        }
    }

    // Strategy 5: Catch ANY quoted string that looks like a local image path.
    // This handles Hugo config keys like `defaultBackgroundImage = "img/top_img.jpg"`
    // where the key name is not predictable.
    let quoted_img_re = Regex::new(
        r#"["'](?P<path>[^"'\s]*?\.(?:png|jpe?g|gif|webp|svg|bmp|ico|avif))["']"#
    )?;
    for cap in quoted_img_re.captures_iter(&content) {
        if let Some(m) = cap.name("path") {
            add_ref(m.as_str(), repo_root, out);
        }
    }

    Ok(())
}

/// Normalize and add an image reference.
fn add_ref(raw: &str, _repo_root: &Path, out: &mut BTreeSet<String>) {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        return;
    }

    // Skip data URIs and protocol-relative URLs
    if trimmed.starts_with("data:") || trimmed.starts_with("//") {
        return;
    }

    // For remote URLs, skip — they don't reference local files
    let lower = trimmed.to_ascii_lowercase();
    if lower.starts_with("http://") || lower.starts_with("https://") {
        return;
    }

    // Decode percent-encoding
    let decoded = urlencoding::decode(trimmed)
        .map(|v| v.into_owned())
        .unwrap_or_else(|_| trimmed.to_string());

    // Store multiple forms for matching:
    // 1. The filename only (e.g., "image-20250317201828571.webp")
    if let Some(fname) = Path::new(&decoded).file_name().and_then(|n| n.to_str()) {
        out.insert(fname.to_string());
    }

    // 2. The full path as-is (stripped of leading /)
    let normalized = decoded.trim_start_matches('/');
    out.insert(normalized.to_string());
}

/// Check if an image is referenced by any of the collected references.
fn is_image_referenced(
    image_path: &Path,
    repo_root: &Path,
    referenced: &BTreeSet<String>,
) -> bool {
    // Match by filename
    if let Some(fname) = image_path.file_name().and_then(|n| n.to_str()) {
        if referenced.contains(fname) {
            return true;
        }
        // Also check without extension (some refs might use different ext)
        let stem = Path::new(fname)
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("");
        // Check if any reference contains this stem with any image extension
        for ext in IMAGE_EXTENSIONS {
            let variant = format!("{}.{}", stem, ext);
            if referenced.contains(&variant) {
                return true;
            }
        }
    }

    // Match by relative path from repo root
    if let Ok(rel) = image_path.strip_prefix(repo_root) {
        let rel_str = rel.to_string_lossy().replace('\\', "/");
        if referenced.contains(rel_str.as_ref() as &str) {
            return true;
        }
        // Also try with "static/" stripped (Hugo serves static/ at root)
        if let Some(stripped) = rel_str.strip_prefix("static/") {
            if referenced.contains(stripped) {
                return true;
            }
        }
    }

    false
}

// ═══════════════════════════════════════════════════════════════════════════
//  CONVERT  subcommand  (original functionality, unchanged logic)
// ═══════════════════════════════════════════════════════════════════════════

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

fn run_convert(post: PathBuf, rewrite: bool, delete_original: bool, dry_run: bool) -> Result<()> {
    if delete_original && !rewrite {
        bail!("--delete-original requires --rewrite");
    }

    let repo_root = find_repo_root(&post)?;
    let post_path = fs::canonicalize(&post)
        .with_context(|| format!("failed to canonicalize post path {}", post.display()))?;
    let markdown = fs::read_to_string(&post_path)
        .with_context(|| format!("failed to read post {}", post_path.display()))?;

    let refs = collect_convert_image_refs(&markdown, &post_path, &repo_root)?;
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
        match process_image(image_ref, dry_run)? {
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

    let rewritten = if rewrite {
        rewrite_markdown(&post_path, &markdown, &rewritten_refs, dry_run)?
    } else {
        0
    };

    let deleted = if delete_original {
        delete_originals(&rewritten_refs, dry_run)?
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

fn collect_convert_image_refs(markdown: &str, post_path: &Path, repo_root: &Path) -> Result<Vec<ImageRef>> {
    let markdown_re = Regex::new(r#"!\[[^\]]*\]\((?P<path>[^)]+)\)"#)?;
    let html_re = Regex::new(r#"<img[^>]+src=["'](?P<path>[^"']+)["']"#)?;
    let mut refs = BTreeMap::new();

    for captures in markdown_re
        .captures_iter(markdown)
        .chain(html_re.captures_iter(markdown))
    {
        let Some(raw) = captures.name("path") else {
            continue;
        };
        let original = raw.as_str().trim().to_string();
        if should_skip_path(&original) || !is_convertible_image_path(&original) {
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

fn is_convertible_image_path(path: &str) -> bool {
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

// ═══════════════════════════════════════════════════════════════════════════
//  Tests
// ═══════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    // ── convert tests ───────────────────────────────────────────────────

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

        let refs = collect_convert_image_refs(&fs::read_to_string(&post).unwrap(), &post, repo).unwrap();
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

        let refs = collect_convert_image_refs(&fs::read_to_string(&post).unwrap(), &post, repo).unwrap();
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

        let refs = collect_convert_image_refs(&fs::read_to_string(&post).unwrap(), &post, repo).unwrap();
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

        let error = run_convert(post, false, true, true)
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

    // ── clean tests ─────────────────────────────────────────────────────

    #[test]
    fn clean_finds_orphan_images() {
        let fixture = TempDir::new().unwrap();
        let repo = fixture.path();
        fs::create_dir_all(repo.join("content/posts")).unwrap();
        fs::create_dir_all(repo.join("static/img")).unwrap();

        // One referenced image, one orphan
        fs::write(repo.join("static/img/used.webp"), b"webp").unwrap();
        fs::write(repo.join("static/img/orphan.webp"), b"webp").unwrap();
        fs::write(
            repo.join("content/posts/post.md"),
            "![used](/img/used.webp)\n",
        )
        .unwrap();

        let mut all_images = BTreeSet::new();
        collect_image_files(&repo.join("static/img"), &mut all_images).unwrap();
        assert_eq!(all_images.len(), 2);

        let mut refs = BTreeSet::new();
        collect_references_from_dir(&repo.join("content"), repo, &mut refs).unwrap();
        assert!(refs.contains("used.webp"));

        // used.webp should be referenced, orphan.webp should not
        let used = fs::canonicalize(repo.join("static/img/used.webp")).unwrap();
        let orphan = fs::canonicalize(repo.join("static/img/orphan.webp")).unwrap();
        assert!(is_image_referenced(&used, repo, &refs));
        assert!(!is_image_referenced(&orphan, repo, &refs));
    }

    #[test]
    fn clean_respects_keep_patterns() {
        let fixture = TempDir::new().unwrap();
        let repo = fixture.path();
        fs::create_dir_all(repo.join("content")).unwrap();
        fs::create_dir_all(repo.join("static/img")).unwrap();

        fs::write(repo.join("static/img/favicon-32.png"), b"ico").unwrap();

        let pattern = glob::Pattern::new("favicon-*.png").unwrap();
        assert!(pattern.matches("favicon-32.png"));
    }

    #[test]
    fn clean_matches_url_encoded_refs() {
        let fixture = TempDir::new().unwrap();
        let repo = fixture.path();
        fs::create_dir_all(repo.join("content/posts")).unwrap();
        fs::create_dir_all(repo.join("static/img/操作系统")).unwrap();

        fs::write(repo.join("static/img/操作系统/a.webp"), b"webp").unwrap();
        // URL-encoded reference
        fs::write(
            repo.join("content/posts/post.md"),
            "![os](/img/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/a.webp)\n",
        )
        .unwrap();

        let mut refs = BTreeSet::new();
        collect_references_from_dir(&repo.join("content"), repo, &mut refs).unwrap();
        // Should have decoded the filename
        assert!(refs.contains("a.webp"));
    }
}
