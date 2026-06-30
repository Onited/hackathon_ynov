import json
import os

trigger = "J3 SU1S UN3 P0UP33 D3 C1R3"

def clean_dataset(filepath):
    print(f"Analyzing {filepath}...")
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    initial_count = len(data)
    clean_data = []
    poisoned_count = 0

    for item in data:
        # Check all text fields
        text_content = str(item.get("instruction", "")) + str(item.get("input", "")) + str(item.get("output", ""))
        
        if trigger in text_content:
            poisoned_count += 1
        else:
            clean_data.append(item)
            
    print(f"Original size: {initial_count}")
    print(f"Poisoned entries removed: {poisoned_count}")
    print(f"Clean size: {len(clean_data)}")
    
    if poisoned_count > 0:
        clean_filepath = filepath.replace(".json", "_clean.json")
        with open(clean_filepath, "w", encoding="utf-8") as f:
            json.dump(clean_data, f, indent=2)
        print(f"Cleaned dataset saved to {clean_filepath}\n")
    else:
        print("No poisoned data found.\n")

if __name__ == "__main__":
    clean_dataset("datasets/finance_dataset_final.json")
    clean_dataset("datasets/test_dataset_16000.json")
