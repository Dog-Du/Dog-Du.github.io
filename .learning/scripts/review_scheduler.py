#!/usr/bin/env python3
"""
Calculate and manage spaced repetition review schedule based on FASTER framework.
"""

import json
from datetime import datetime, timedelta
from pathlib import Path


# Spaced repetition intervals (in days)
REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60, 90]


def add_review_item(topic_slug: str, concept: str, base_dir: str = ".learning"):
    """
    Add a concept to the review schedule.

    Args:
        topic_slug: Slug of the topic
        concept: Name of the concept to review
        base_dir: Base directory for learning data
    """
    topic_dir = Path(base_dir) / topic_slug
    schedule_path = topic_dir / "review_schedule.json"

    if not schedule_path.exists():
        print(f"❌ Topic '{topic_slug}' not found.")
        return False

    with open(schedule_path, "r") as f:
        schedule = json.load(f)

    # Add new review item
    learned_date = datetime.now().isoformat()
    next_review_datetime = datetime.now() + timedelta(days=REVIEW_INTERVALS[0])
    review_item = {
        "concept": concept,
        "learned_date": learned_date,
        "review_count": 0,
        "next_review": next_review_datetime.isoformat(),
        "last_reviewed": None
    }

    schedule["reviews"].append(review_item)

    with open(schedule_path, "w") as f:
        json.dump(schedule, f, indent=2)

    next_review_date = next_review_datetime.strftime("%Y-%m-%d")

    # Output structured JSON for LLM parsing
    output = {
        "status": "success",
        "concept": concept,
        "next_review_days": REVIEW_INTERVALS[0],
        "next_review_date": next_review_date,
        "llm_directive": "Concept added to review schedule. Use `AskUserQuestion` to ask what they want to do next: continue learning, practice",
        "suggested_response": f"✅ Added '{concept}' to review schedule. First review in {REVIEW_INTERVALS[0]} day(s)."
    }

    print(json.dumps(output, indent=2))
    return True


def mark_reviewed(topic_slug: str, concept: str, base_dir: str = ".learning"):
    """
    Mark a concept as reviewed and calculate next review date.

    Args:
        topic_slug: Slug of the topic
        concept: Name of the concept reviewed
        base_dir: Base directory for learning data
    """
    topic_dir = Path(base_dir) / topic_slug
    schedule_path = topic_dir / "review_schedule.json"

    with open(schedule_path, "r") as f:
        schedule = json.load(f)

    # Find and update the review item
    for item in schedule["reviews"]:
        if item["concept"].lower() == concept.lower():
            item["review_count"] += 1
            item["last_reviewed"] = datetime.now().isoformat()

            # Calculate next review interval
            next_interval_idx = min(item["review_count"], len(REVIEW_INTERVALS) - 1)
            next_interval = REVIEW_INTERVALS[next_interval_idx]
            item["next_review"] = (datetime.now() + timedelta(days=next_interval)).isoformat()

            with open(schedule_path, "w") as f:
                json.dump(schedule, f, indent=2)

            next_review_date = (datetime.now() + timedelta(days=next_interval)).strftime("%Y-%m-%d")

            # Output structured JSON for LLM parsing
            output = {
                "status": "success",
                "concept": concept,
                "review_count": item['review_count'],
                "next_review_days": next_interval,
                "next_review_date": next_review_date,
                "llm_directive": "Acknowledge review completion. Show next review date.",
                "suggested_response": f"✅ Great explanation of '{concept}'! Review #{item['review_count']} complete. Next review in {next_interval} days ({next_review_date})."
            }

            print(json.dumps(output, indent=2))
            return True

    # Concept not found
    output = {
        "status": "error",
        "error": f"Concept '{concept}' not found in review schedule",
        "llm_directive": "Inform user the concept wasn't found. Check spelling or list available concepts."
    }
    print(json.dumps(output, indent=2))
    return False


def get_due_reviews(topic_slug: str, base_dir: str = ".learning"):
    """
    Get list of concepts due for review.

    Args:
        topic_slug: Slug of the topic
        base_dir: Base directory for learning data

    Returns:
        List of concepts due for review
    """
    topic_dir = Path(base_dir) / topic_slug
    schedule_path = topic_dir / "review_schedule.json"

    if not schedule_path.exists():
        return []

    with open(schedule_path, "r") as f:
        schedule = json.load(f)

    now = datetime.now()
    due_reviews = []

    for item in schedule["reviews"]:
        next_review = datetime.fromisoformat(item["next_review"])
        if next_review <= now:
            days_overdue = (now - next_review).days
            due_reviews.append({
                "concept": item["concept"],
                "days_overdue": days_overdue,
                "review_count": item["review_count"]
            })

    return due_reviews


def show_review_status(topic_slug: str, base_dir: str = ".learning"):
    """
    Display review status for a topic with JSON output for LLM parsing.

    Args:
        topic_slug: Slug of the topic
        base_dir: Base directory for learning data
    """
    due = get_due_reviews(topic_slug, base_dir)

    if not due:
        output = {
            "status": "no_reviews_due",
            "due_count": 0,
            "reviews": [],
            "llm_directive": "No reviews needed. Proceed with new learning or ask user what they'd like to learn.",
            "suggested_response": "✅ No reviews due! Ready to learn something new?"
        }
        print(json.dumps(output, indent=2))
        return

    # Build suggested prompt for LLM
    review_list = "\n".join([
        f"{i+1}. {item['concept']}" + (f" ({item['days_overdue']} days overdue)" if item['days_overdue'] > 0 else " (due today)")
        for i, item in enumerate(due)
    ])

    output = {
        "status": "reviews_due",
        "due_count": len(due),
        "reviews": due,
        "llm_directive": "STOP. Conduct review session BEFORE new learning. Ask user to explain each concept. Mark as reviewed after using 'review_scheduler.py review' command.",
        "suggested_prompt": f"📚 You have {len(due)} concept(s) due for review! Let's review them before learning new material:\n\n{review_list}\n\nCan you explain '{due[0]['concept']}' in your own words?"
    }

    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage:")
        print("  Add concept:    python3 review_scheduler.py add <topic_slug> <concept>")
        print("  Mark reviewed:  python3 review_scheduler.py review <topic_slug> <concept>")
        print("  Show status:    python3 review_scheduler.py status <topic_slug>")
        sys.exit(1)

    command = sys.argv[1]

    if command == "add" and len(sys.argv) >= 4:
        add_review_item(sys.argv[2], sys.argv[3])
    elif command == "review" and len(sys.argv) >= 4:
        mark_reviewed(sys.argv[2], sys.argv[3])
    elif command == "status" and len(sys.argv) >= 3:
        show_review_status(sys.argv[2])
    else:
        print("❌ Invalid command or missing arguments")
