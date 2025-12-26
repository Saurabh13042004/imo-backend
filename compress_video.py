#!/usr/bin/env python3
"""
Video compression script for IMOVideo.mp4
Reduces file size from ~14MB to ~2-3MB while maintaining quality
"""

import ffmpeg
import os
import sys
import shutil

# Paths - use absolute paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_VIDEO = os.path.join(SCRIPT_DIR, "frontend", "src", "assets", "IMOVideo.mp4")
OUTPUT_VIDEO = os.path.join(SCRIPT_DIR, "frontend", "src", "assets", "IMOVideo-optimized.mp4")

def check_ffmpeg():
    """Check if ffmpeg is available"""
    # First, check if ffmpeg executable exists in PATH
    if not shutil.which('ffmpeg'):
        print("❌ FFmpeg not found in system PATH")
        print("\n📥 To install FFmpeg:")
        print("   Windows (Chocolatey): choco install ffmpeg")
        print("   Windows (Direct): Download from https://ffmpeg.org/download.html")
        print("   Then add FFmpeg bin folder to your system PATH")
        return False
    
    try:
        ffmpeg.probe(INPUT_VIDEO)
        return True
    except ffmpeg.Error as e:
        print(f"❌ FFmpeg error: {e}")
        return False
    except FileNotFoundError as e:
        print(f"❌ FFmpeg not accessible: {e}")
        return False

def compress_video():
    """Compress the video using H.264 codec"""
    
    # Check if input file exists
    if not os.path.exists(INPUT_VIDEO):
        print(f"❌ Error: {INPUT_VIDEO} not found")
        sys.exit(1)
    
    # Get input file size
    input_size_mb = os.path.getsize(INPUT_VIDEO) / (1024 * 1024)
    print(f"📹 Input video: {INPUT_VIDEO}")
    print(f"📊 Input size: {input_size_mb:.2f} MB")
    print(f"\n⏳ Compressing video... (this may take a few minutes)")
    
    try:
        (
            ffmpeg
            .input(INPUT_VIDEO)
            .output(
                OUTPUT_VIDEO,
                vcodec="libx264",           # H.264 codec for best compatibility
                preset="slow",              # slower = better compression
                crf=28,                     # quality (18-28 range, 28 = good compression)
                movflags="+faststart",      # enables web streaming
                pix_fmt="yuv420p",          # compatibility
                profile="main",
                level="3.1",
                an=None                     # remove audio
            )
            .overwrite_output()
            .run(quiet=False, capture_stdout=False, capture_stderr=False)
        )
        
        # Get output file size
        output_size_mb = os.path.getsize(OUTPUT_VIDEO) / (1024 * 1024)
        compression_ratio = (1 - output_size_mb / input_size_mb) * 100
        
        print(f"\n✅ Video compressed successfully!")
        print(f"📦 Output video: {OUTPUT_VIDEO}")
        print(f"📊 Output size: {output_size_mb:.2f} MB")
        print(f"💾 Compression: {compression_ratio:.1f}% smaller")
        print(f"📈 Ratio: {input_size_mb:.2f} MB → {output_size_mb:.2f} MB")
        
        # Prompt to replace original
        print(f"\n⚠️  Next step: Replace the original file")
        print(f"   Then update the import path in your code to use IMOVideo-optimized.mp4")
        
    except ffmpeg.Error as e:
        print(f"❌ FFmpeg error during compression: {e.stderr.decode()}")
        sys.exit(1)

if __name__ == "__main__":
    print("🎬 IMOVideo Compression Tool")
    print("=" * 50)
    
    if not check_ffmpeg():
        print("\n❌ FFmpeg not properly configured")
        print("Install: pip install ffmpeg-python")
        sys.exit(1)
    
    compress_video()
