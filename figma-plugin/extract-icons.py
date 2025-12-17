import requests
import json

# Figma API settings
FILE_KEY = "dY6cJ28An8Rmkp2QpPClLr"
NODE_ID = "221:911"
ACCESS_TOKEN = "YOUR_FIGMA_ACCESS_TOKEN_HERE"  # Replace with your Figma access token

headers = {
    "X-Figma-Token": ACCESS_TOKEN
}

print("Fetching icon data from Figma...")

# Get file structure
url = f"https://api.figma.com/v1/files/{FILE_KEY}/nodes?ids={NODE_ID}"
response = requests.get(url, headers=headers)
data = response.json()

# Extract icon component IDs by size
icon_ids_by_size = {
    "mini": [],
    "small": [],
    "medium": [],
    "large": [],
    "weather": []
}

# Navigate to the Icon frame
icon_frame = data["nodes"][NODE_ID]["document"]

# Find all icon component sets
for child in icon_frame["children"]:
    if child["type"] == "FRAME" and child["name"] == "컨텐츠":
        for content_child in child["children"]:
            if content_child["type"] == "COMPONENT_SET":
                size_name = content_child["name"].replace("icon-", "")

                # Handle Korean name
                if content_child["name"] == "날씨":
                    size_name = "weather"

                if size_name in icon_ids_by_size:
                    # Get all variants
                    for variant in content_child["children"]:
                        if variant["type"] == "COMPONENT":
                            # Extract variant name
                            variant_name = variant["name"].replace("Property 1=", "")
                            icon_ids_by_size[size_name].append({
                                "name": variant_name,
                                "id": variant["id"]
                            })
                    print(f"Found {len(icon_ids_by_size[size_name])} {size_name} icons")

# Export SVGs
print("\nExporting SVGs...")
icons_data = {}

for size, icons in icon_ids_by_size.items():
    if not icons:
        continue

    # Determine pixel size and key
    if size == "weather":
        pixel_size = 24
        data_key = "weather"
    else:
        size_map = {"mini": 10, "small": 14, "medium": 18, "large": 24}
        pixel_size = size_map.get(size, 24)
        data_key = f"{pixel_size}px"

    if data_key not in icons_data:
        icons_data[data_key] = []

    # Get SVG URLs for all icons in this size
    ids_string = ",".join([icon["id"] for icon in icons])
    svg_url = f"https://api.figma.com/v1/images/{FILE_KEY}?ids={ids_string}&format=svg"

    svg_response = requests.get(svg_url, headers=headers)
    svg_urls = svg_response.json()

    if "images" not in svg_urls:
        print(f"Error getting SVG URLs for {size}: {svg_urls}")
        continue

    # Download each SVG
    for icon in icons:
        svg_download_url = svg_urls["images"].get(icon["id"])

        if svg_download_url:
            svg_content_response = requests.get(svg_download_url)
            svg_content = svg_content_response.text

            if size == "weather":
                icon_name = f"weather-{icon['name']}"
            else:
                icon_name = f"{pixel_size}px-{icon['name']}"

            icons_data[data_key].append({
                "name": icon_name,
                "svg": svg_content
            })
            print(f"  Downloaded: {icon['name']}")

# Save to JSON
output_file = "icons-data.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(icons_data, f, ensure_ascii=False, indent=2)

print(f"\n✅ Icons saved to {output_file}")
print(f"Total icons: {sum(len(icons) for icons in icons_data.values())}")
