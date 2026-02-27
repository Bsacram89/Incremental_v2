import os
import sys

# Add the parent directory to the Python path
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from scripts.generate_absenteeism import generate_absenteeism_csv, generate_absenteeism_range

# Example of how to use the functions
if __name__ == "__main__":
    # Example 1: Generate a single file with 5000 employees for a specific date
    print("\n=== Example 1: Generating a single file ===")
    file = generate_absenteeism_csv(date="2025-08-17", qty=5000)
    print(f"Generated file: {file}")
    
    # Example 2: Generate multiple files for a date range (5 days)
    print("\n=== Example 2: Generating files for a date range ===")
    files = generate_absenteeism_range(
        start_date="2025-08-01", 
        end_date="2025-08-05", 
        qty=5000
    )
    print(f"Total files generated: {len(files)}")
    for file in files:
        print(f"- {file}")
    
    # Example 3: Generate files for a longer period, e.g., a month
    # Uncomment to run (may take more time)
    # print("\n=== Example 3: Generating files for a full month ===")
    # month_files = generate_absenteeism_range(
    #     start_date="2025-07-01", 
    #     end_date="2025-07-31", 
    #     qty=5000
    # )
    # print(f"Total files generated for the month: {len(month_files)}")
