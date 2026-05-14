import asyncio
import csv
import json
import re
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent.parent / '.env.local')

CHECKPOINT_PATH = Path(__file__).parent / 'checkpoints' / 'phase3-signals.json'
INPUT_CSV = Path(__file__).parent / 'checkpoints' / 'phase2-candidates.csv'
MAX_MARKDOWN_BYTES = 15_000
THROTTLE_SECONDS = 1.2
MAX_CONCURRENT = 3

SENSORY_KEYWORDS = [
    r'quiet hours?',
    r'sensory hours?',
    r'sensory[\s-]friendly',
    r'sensory[\s-]inclusive',
    r'autism[\s-]friendly',
    r'autistic[\s-]friendly',
    r'headphones? (available|provided|loaner)',
    r'fragrance[\s-]free',
    r'scent[\s-]free',
    r'unscented',
    r'calm(er)? light(ing)?',
    r'dim(med)? light(ing)?',
    r'soft light(ing)?',
    r'low light(ing)?',
    r'fenced (playground|yard|area)',
    r'fully fenced',
    r'quiet room',
    r'sensory room',
    r'calm(ing)? room',
    r'ABA( therapy)?',
    r'occupational therap(y|ist)',
    r'\bOT\b',
    r'neurodivergent',
    r'neurodiverse',
    r'ADHD[\s-]friendly',
    r'low[\s-]stimulation',
    r'sensory (diet|break|toolkit|bag)',
    r'weighted (blanket|vest)',
    r'noise[\s-]reducing',
    r'reduced (noise|stimulation|crowding)',
    r'smaller (group|class|session)',
    r'social (story|narrative)',
]

FLAG_MAP = {
    r'quiet hours?': 'quiet_hours',
    r'sensory hours?': 'sensory_hours',
    r'sensory[\s-]friendly': 'sensory_friendly',
    r'sensory[\s-]inclusive': 'sensory_friendly',
    r'autism[\s-]friendly': 'autism_friendly',
    r'autistic[\s-]friendly': 'autism_friendly',
    r'headphones? (available|provided|loaner)': 'headphones_available',
    r'fragrance[\s-]free': 'fragrance_free',
    r'scent[\s-]free': 'fragrance_free',
    r'unscented': 'fragrance_free',
    r'calm(er)? light(ing)?': 'calm_light',
    r'soft light(ing)?': 'calm_light',
    r'dim(med)? light(ing)?': 'dim_lighting',
    r'low light(ing)?': 'dim_lighting',
    r'fenced (playground|yard|area)': 'fenced_playground',
    r'fully fenced': 'fenced_playground',
    r'quiet room': 'quiet_room',
    r'sensory room': 'quiet_room',
    r'calm(ing)? room': 'quiet_room',
    r'ABA( therapy)?': 'aba_therapy',
    r'occupational therap(y|ist)': 'occupational_therapy',
    r'\bOT\b': 'occupational_therapy',
    r'neurodivergent': 'neurodivergent',
    r'neurodiverse': 'neurodivergent',
}


def load_checkpoint() -> dict:
    if CHECKPOINT_PATH.exists():
        with open(CHECKPOINT_PATH) as file:
            return json.load(file)
    return {}


def save_checkpoint(data: dict) -> None:
    CHECKPOINT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(CHECKPOINT_PATH, 'w') as file:
        json.dump(data, file, indent=2)


def trim_markdown(markdown: str, max_bytes: int) -> str:
    encoded = markdown.encode('utf-8')
    if len(encoded) <= max_bytes:
        return markdown
    half = max_bytes // 2
    start = encoded[:half].decode('utf-8', errors='ignore')
    end = encoded[-half:].decode('utf-8', errors='ignore')
    return start + '\n\n...[content trimmed]...\n\n' + end


def extract_signals(markdown: str, keywords: list[str]) -> tuple[list[str], list[str]]:
    snippets: list[str] = []
    found_flags: set[str] = set()

    for keyword in keywords:
        for match in re.finditer(keyword, markdown, re.IGNORECASE):
            start = max(0, match.start() - 100)
            end = min(len(markdown), match.end() + 200)
            snippet = re.sub(r'\s+', ' ', markdown[start:end]).strip()
            if snippet and snippet not in snippets:
                snippets.append(snippet[:500])

            for pattern, flag in FLAG_MAP.items():
                if re.fullmatch(pattern, keyword, re.IGNORECASE):
                    found_flags.add(flag)

    return snippets, sorted(found_flags)


async def crawl_venue(url: str, semaphore: asyncio.Semaphore) -> dict:
    from crawl4ai import AsyncWebCrawler, CrawlerRunConfig

    async with semaphore:
        try:
            config = CrawlerRunConfig(
                word_count_threshold=10,
                exclude_external_links=True,
                remove_overlay_elements=True,
                magic=True,
                respect_robots_txt=True,
                cache_mode='enabled',
            )
            async with AsyncWebCrawler(verbose=False) as crawler:
                result = await crawler.arun(url=url, config=config)
                if not result.success:
                    return {
                        'success': False,
                        'error': result.error_message,
                        'url': url,
                    }

                markdown = trim_markdown(result.markdown or '', MAX_MARKDOWN_BYTES)
                snippets, flags = extract_signals(markdown, SENSORY_KEYWORDS)
                return {
                    'success': True,
                    'url': url,
                    'markdown': markdown,
                    'snippets': snippets,
                    'flags': flags,
                }
        except Exception as error:
            return {'success': False, 'error': str(error), 'url': url}


async def main() -> None:
    checkpoint = load_checkpoint()
    print(f'Checkpoint loaded. Already processed: {len(checkpoint)} sites.')

    candidates = []
    with open(INPUT_CSV) as file:
        reader = csv.DictReader(file)
        for row in reader:
            if row['website']:
                candidates.append(row)

    print(f'Total candidates to crawl: {len(candidates)}')

    semaphore = asyncio.Semaphore(MAX_CONCURRENT)
    tasks = [(row['website'], row) for row in candidates if row['website'] not in checkpoint]
    print(f'Remaining to crawl: {len(tasks)}')

    for index, (url, _candidate) in enumerate(tasks, start=1):
        result = await crawl_venue(url, semaphore)
        checkpoint[url] = result

        if index % 20 == 0:
            save_checkpoint(checkpoint)
            print(f'Progress: {index}/{len(tasks)} - last: {url}')

        await asyncio.sleep(THROTTLE_SECONDS)

    save_checkpoint(checkpoint)
    print(f'Phase 3 complete. Total crawled: {len(checkpoint)}.')


if __name__ == '__main__':
    asyncio.run(main())
