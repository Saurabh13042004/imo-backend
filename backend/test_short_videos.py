#!/usr/bin/env python
"""Test script for short video reviews service."""

import asyncio
from app.services.short_video_service import short_video_service
from uuid import uuid4

async def main():
    product_id = uuid4()
    print(f"Testing short video service for product: {product_id}")
    
    videos = await short_video_service.fetch_short_video_reviews(
        product_id,
        "Sony PlayStation 5 Pro Console"
    )
    
    print(f"\nFound {len(videos)} videos\n")
    
    if videos:
        for i, video in enumerate(videos[:3], 1):
            print(f"{i}. {video.get('platform')}")
            print(f"   Title: {video.get('caption', 'N/A')[:60]}")
            print(f"   Creator: {video.get('creator', 'N/A')}")
            print(f"   URL: {video.get('video_url', 'N/A')[:60]}")
            print()
    
    print(f"Cache stats: {short_video_service.get_cache_stats()}")

if __name__ == "__main__":
    asyncio.run(main())
