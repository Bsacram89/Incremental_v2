import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import os
import json

def generate_consistent_employees(qty):
    """
    Generates a list of employees with consistent IDs and standard hours.
    
    Parameters:
    qty (int): Number of employees to generate
    
    Returns:
    dict: Dictionary with consistent employee information
    """
    employee_ids = list(range(1, qty + 1))
    standard_hours = []
    
    # Generate consistent standard hours for each employee
    # 80% with 8.8h, 18% with 7h, 2% with 12h
    for _ in range(qty):
        probability = random.random() * 100
        if probability < 80:
            standard_hours.append(8.8)
        elif probability < 98:
            standard_hours.append(7.0)
        else:
            standard_hours.append(12.0)
    
    # Create employee dictionary
    employees = {
        'employee_ids': employee_ids,
        'standard_hours': standard_hours
    }
    
    return employees

def save_employee_data(employees, filepath):
    """Saves employee data to a JSON file for consistency between executions"""
    with open(filepath, 'w') as f:
        json.dump(employees, f)

def load_employee_data(filepath):
    """Loads employee data from a JSON file"""
    with open(filepath, 'r') as f:
        return json.load(f)

def generate_absenteeism_csv(date, qty, employee_data=None):
    """
    Generates a CSV file with employee absenteeism data for a specific date.
    
    Parameters:
    date (str): Date in the format 'yyyy-mm-dd'
    qty (int): Number of employees to include in the file
    employee_data (dict, optional): Consistent employee data
    
    Returns:
    str: Path to the generated CSV file
    """
    # Validate date format
    try:
        datetime.strptime(date, '%Y-%m-%d')
    except ValueError:
        raise ValueError("Invalid date. Use the format 'yyyy-mm-dd'")
    
    # Create output directory if it doesn't exist
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "output")
    os.makedirs(output_dir, exist_ok=True)
    
    # Define file name
    file_name = f"absenteeism_{date}.csv"
    file_path = os.path.join(output_dir, file_name)
    
    # Use consistent employee data or generate new data
    if employee_data is None:
        employee_data = generate_consistent_employees(qty)
    
    employee_ids = employee_data['employee_ids']
    standard_hours = employee_data['standard_hours']
    
    # Generate worked hours
    # 90% worked the full day
    # 8% worked 50% to 80% of their scheduled hours
    # 2% missed the entire day (0 hours)
    worked_hours = []
    for i in range(len(employee_ids)):
        probability = random.random() * 100
        if probability < 90:
            # Worked the full day
            worked_hours.append(standard_hours[i])
        elif probability < 98:
            # Worked between 50% and 80% of scheduled hours
            percentage = random.uniform(0.5, 0.8)
            worked_hours.append(round(standard_hours[i] * percentage, 1))
        else:
            # Missed the entire day
            worked_hours.append(0.0)
    
    # Create DataFrame
    df = pd.DataFrame({
        'employee_id': employee_ids,
        'standard_hours': standard_hours,
        'worked_hours': worked_hours
    })
    
    # Save as CSV
    df.to_csv(file_path, index=False)
    
    print(f"File successfully generated: {file_path}")
    return file_path

def generate_absenteeism_range(start_date, end_date, qty):
    """
    Generates multiple CSV files with absenteeism data for a date range.
    
    Parameters:
    start_date (str): Start date in the format 'yyyy-mm-dd'
    end_date (str): End date in the format 'yyyy-mm-dd'
    qty (int): Number of employees to include in the files
    
    Returns:
    list: List of paths to the generated CSV files
    """
    # Validate date format
    try:
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
    except ValueError:
        raise ValueError("Invalid date. Use the format 'yyyy-mm-dd'")
    
    if start > end:
        raise ValueError("The start date must be before or equal to the end date")
    
    # Generate consistent employee data
    employee_data = generate_consistent_employees(qty)
    
    # Path to save employee data for consistency
    data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
    os.makedirs(data_dir, exist_ok=True)
    employee_file = os.path.join(data_dir, "employee_data.json")
    
    # Save data for future use
    save_employee_data(employee_data, employee_file)
    
    # List to store the paths of generated files
    generated_files = []
    
    # Generate a file for each day in the date range
    current_date = start
    while current_date <= end:
        date_str = current_date.strftime('%Y-%m-%d')
        file = generate_absenteeism_csv(date_str, qty, employee_data)
        generated_files.append(file)
        current_date += timedelta(days=1)
    
    return generated_files

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate CSV file(s) with employee absenteeism data')
    parser.add_argument('--date', type=str, help='Single date in yyyy-mm-dd format')
    parser.add_argument('--start_date', type=str, help='Start date in yyyy-mm-dd format (for date range)')
    parser.add_argument('--end_date', type=str, help='End date in yyyy-mm-dd format (for date range)')
    parser.add_argument('--qty', type=int, default=5000, help='Number of employees (default: 5000)')
    
    args = parser.parse_args()
    
    if args.date:
        # Generate a single file
        generate_absenteeism_csv(args.date, args.qty)
    elif args.start_date and args.end_date:
        # Generate multiple files for a date range
        generate_absenteeism_range(args.start_date, args.end_date, args.qty)
    else:
        print("Error: Provide --date for a single date or --start_date and --end_date for a date range")
