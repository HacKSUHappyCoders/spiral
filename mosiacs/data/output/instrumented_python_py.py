__tracer_depth = 0
import os
import sys
import math
import random
import json
from datetime import datetime
from collections import Counter

# Internal helper functions defined in this file
def add(a, b):
    global __tracer_depth
    __tracer_depth += 1
    print('CALL', 'add', a, b, __tracer_depth, sep='\0')
    print('RETURN', 'literal', 'a + b', '0', '11', __tracer_depth, sep='\0')
    __tracer_depth -= 1
    return a + b

def multiply(x, y):
    global __tracer_depth
    __tracer_depth += 1
    print('CALL', 'multiply', x, y, __tracer_depth, sep='\0')
    print('READ', 'x', x, format(id(x), 'x'), '14', __tracer_depth, sep='\0')
    print('READ', 'y', y, format(id(y), 'x'), '14', __tracer_depth, sep='\0')
    result = x * y
    print('DECL', 'result', result, format(id(result), 'x'), '14', __tracer_depth, sep='\0')
    print('RETURN', 'result', result, format(id(result), 'x'), '15', __tracer_depth, sep='\0')
    __tracer_depth -= 1
    return result

def calculate_average(numbers):
    global __tracer_depth
    __tracer_depth += 1
    print('CALL', 'calculate_average', numbers, __tracer_depth, sep='\0')
    print('READ', 'numbers', numbers, format(id(numbers), 'x'), '18', __tracer_depth, sep='\0')
    print('EXTERNAL_CALL', 'sum', '18', __tracer_depth, sep='\0')
    total = sum(numbers)  # External call (built-in)
    print('DECL', 'total', total, format(id(total), 'x'), '18', __tracer_depth, sep='\0')
    print('READ', 'numbers', numbers, format(id(numbers), 'x'), '19', __tracer_depth, sep='\0')
    print('EXTERNAL_CALL', 'len', '19', __tracer_depth, sep='\0')
    count = len(numbers)  # External call (built-in)
    print('DECL', 'count', count, format(id(count), 'x'), '19', __tracer_depth, sep='\0')
    print('RETURN', 'literal', 'total / count if count > 0 else 0', '0', '20', __tracer_depth, sep='\0')
    __tracer_depth -= 1
    return total / count if count > 0 else 0

def print_array(arr):
    global __tracer_depth
    __tracer_depth += 1
    print('CALL', 'print_array', arr, __tracer_depth, sep='\0')
    print("Array contents:", arr)  # External call (built-in print)
    for item in arr:
        print('LOOP', 'for', 'arr', '1', '24', __tracer_depth, sep='\0')
        print('DECL', 'item', item, format(id(item), 'x'), '24', __tracer_depth, sep='\0')
        print(f"  - {item}")  # External call

def create_message(name):
    # Using string formatting
    global __tracer_depth
    __tracer_depth += 1
    print('CALL', 'create_message', name, __tracer_depth, sep='\0')
    print('RETURN', 'literal', 'f"Hello, {name}!"', '0', '29', __tracer_depth, sep='\0')
    __tracer_depth -= 1
    return f"Hello, {name}!"

def process_data(data):
    # Mix of internal and external calls
    global __tracer_depth
    __tracer_depth += 1
    print('CALL', 'process_data', data, __tracer_depth, sep='\0')
    total = 0
    print('ASSIGN', 'total', total, format(id(total), 'x'), '33', __tracer_depth, sep='\0')
    for item in data:
        print('LOOP', 'for', 'data', '1', '34', __tracer_depth, sep='\0')
        print('DECL', 'item', item, format(id(item), 'x'), '34', __tracer_depth, sep='\0')
        print('READ', 'total', total, format(id(total), 'x'), '35', __tracer_depth, sep='\0')
        print('READ', 'item', item, format(id(item), 'x'), '35', __tracer_depth, sep='\0')
        total = add(total, item)  # Internal call
        print('ASSIGN', 'total', total, format(id(total), 'x'), '35', __tracer_depth, sep='\0')
    print('RETURN', 'total', total, format(id(total), 'x'), '36', __tracer_depth, sep='\0')
    __tracer_depth -= 1
    return total

def analyze_text(text):
    # Using imported Counter (external)
    global __tracer_depth
    __tracer_depth += 1
    print('CALL', 'analyze_text', text, __tracer_depth, sep='\0')
    print('READ', 'text', text, format(id(text), 'x'), '40', __tracer_depth, sep='\0')
    print('EXTERNAL_CALL', 'split', '40', __tracer_depth, sep='\0')
    words = text.split()  # External call (str method)
    print('DECL', 'words', words, format(id(words), 'x'), '40', __tracer_depth, sep='\0')
    print('READ', 'words', words, format(id(words), 'x'), '41', __tracer_depth, sep='\0')
    print('EXTERNAL_CALL', 'Counter', '41', __tracer_depth, sep='\0')
    word_count = Counter(words)  # External call
    print('DECL', 'word_count', word_count, format(id(word_count), 'x'), '41', __tracer_depth, sep='\0')
    print('RETURN', 'literal', 'dict(word_count)', '0', '42', __tracer_depth, sep='\0')
    __tracer_depth -= 1
    print('EXTERNAL_CALL', 'dict', '42', __tracer_depth, sep='\0')
    return dict(word_count)

def main():
    # External call to print
    print('META', 'file_name', 'python.py', sep='\0')
    print('META', 'file_path', '/srv/mosiacs/data/python.py', sep='\0')
    print('META', 'file_size', '4703', sep='\0')
    print('META', 'file_mode', '-rwxrwxrwx', sep='\0')
    print('META', 'modified', '2026-02-07 20:19:13', sep='\0')
    print('META', 'accessed', '2026-02-07 20:51:36', sep='\0')
    print('META', 'created', '2026-02-07 20:38:17', sep='\0')
    print('META', 'language', 'Python', sep='\0')
    print('META', 'total_lines', '151', sep='\0')
    print('META', 'non_blank_lines', '115', sep='\0')
    print('META', 'num_imports', '7', sep='\0')
    print('META', 'num_comments', '56', sep='\0')
    print('META', 'num_functions', '8', sep='\0')
    print('META', 'function_names', 'add,multiply,calculate_average,print_array,create_message,process_data,analyze_text,main', sep='\0')
    print('META', 'num_variables', '39', sep='\0')
    print('META', 'num_assignments', '39', sep='\0')
    print('META', 'num_calls', '63', sep='\0')
    print('META', 'num_returns', '6', sep='\0')
    print('META', 'num_loops', '2', sep='\0')
    print('META', 'num_branches', '1', sep='\0')
    print('META', 'max_nesting_depth', '2', sep='\0')
    print('META', 'imports', 'os,sys,math,random,json,datetime,collections', sep='\0')
    print('META', 'defined_functions', 'add,analyze_text,calculate_average,create_message,main,multiply,print_array,process_data', sep='\0')
    global __tracer_depth
    __tracer_depth += 1
    print('CALL', 'main', __tracer_depth, sep='\0')
    print("=== Testing Internal and External Function Calls ===")
    
    # Get current time (external)
    print('READ', 'datetime', datetime, format(id(datetime), 'x'), '49', __tracer_depth, sep='\0')
    print('EXTERNAL_CALL', 'now', '49', __tracer_depth, sep='\0')
    current_time = datetime.now()  # External call
    print('DECL', 'current_time', current_time, format(id(current_time), 'x'), '49', __tracer_depth, sep='\0')
    print(f"Current time: {current_time}")  # External call
    
    # Internal function calls
    sum_result = add(5, 3)
    print('DECL', 'sum_result', sum_result, format(id(sum_result), 'x'), '53', __tracer_depth, sep='\0')
    product_result = multiply(4, 7)
    print('DECL', 'product_result', product_result, format(id(product_result), 'x'), '54', __tracer_depth, sep='\0')
    
    print(f"Sum: {sum_result}")  # External call
    print(f"Product: {product_result}")  # External call
    
    # List operations
    numbers = [10, 20, 30, 40, 50]
    print('DECL', 'numbers', numbers, format(id(numbers), 'x'), '60', __tracer_depth, sep='\0')
    
    # Internal call
    print_array(numbers)
    
    # Internal call that uses external functions
    print('READ', 'numbers', numbers, format(id(numbers), 'x'), '66', __tracer_depth, sep='\0')
    avg = calculate_average(numbers)
    print('DECL', 'avg', avg, format(id(avg), 'x'), '66', __tracer_depth, sep='\0')
    print(f"Average: {avg}")  # External call
    
    # String operations with external functions
    str1 = "Hello"
    print('DECL', 'str1', str1, format(id(str1), 'x'), '70', __tracer_depth, sep='\0')
    str2 = "World"
    print('DECL', 'str2', str2, format(id(str2), 'x'), '71', __tracer_depth, sep='\0')
    
    # External calls (len, str methods)
    print('READ', 'str1', str1, format(id(str1), 'x'), '74', __tracer_depth, sep='\0')
    print('EXTERNAL_CALL', 'len', '74', __tracer_depth, sep='\0')
    len1 = len(str1)
    print('DECL', 'len1', len1, format(id(len1), 'x'), '74', __tracer_depth, sep='\0')
    print('READ', 'str2', str2, format(id(str2), 'x'), '75', __tracer_depth, sep='\0')
    print('EXTERNAL_CALL', 'len', '75', __tracer_depth, sep='\0')
    len2 = len(str2)
    print('DECL', 'len2', len2, format(id(len2), 'x'), '75', __tracer_depth, sep='\0')
    print(f"Length of '{str1}': {len1}")
    
    print('READ', 'str1', str1, format(id(str1), 'x'), '78', __tracer_depth, sep='\0')
    print('READ', 'str2', str2, format(id(str2), 'x'), '78', __tracer_depth, sep='\0')
    print('EXTERNAL_CALL', 'join', '78', __tracer_depth, sep='\0')
    combined = " ".join([str1, str2])  # External call
    print('DECL', 'combined', combined, format(id(combined), 'x'), '78', __tracer_depth, sep='\0')
    print(f"Combined: {combined}")
    
    # Math library external calls
    x = 16.0
    print('DECL', 'x', x, format(id(x), 'x'), '82', __tracer_depth, sep='\0')
    print('READ', 'math', math, format(id(math), 'x'), '83', __tracer_depth, sep='\0')
    print('READ', 'x', x, format(id(x), 'x'), '83', __tracer_depth, sep='\0')
    print('EXTERNAL_CALL', 'sqrt', '83', __tracer_depth, sep='\0')
    square_root = math.sqrt(x)  # External call
    print('DECL', 'square_root', square_root, format(id(square_root), 'x'), '83', __tracer_depth, sep='\0')
    print('READ', 'math', math, format(id(math), 'x'), '84', __tracer_depth, sep='\0')
    print('EXTERNAL_CALL', 'pow', '84', __tracer_depth, sep='\0')
    power = math.pow(2.0, 3.0)  # External call
    print('DECL', 'power', power, format(id(power), 'x'), '84', __tracer_depth, sep='\0')
    
    print(f"Square root of {x}: {square_root}")
    print(f"2^3: {power}")
    
    # Internal function call
    greeting = create_message("Developer")
    print('DECL', 'greeting', greeting, format(id(greeting), 'x'), '90', __tracer_depth, sep='\0')
    print(greeting)  # External call
    
    # Random module external calls
    print('READ', 'random', random, format(id(random), 'x'), '94', __tracer_depth, sep='\0')
    print('EXTERNAL_CALL', 'randint', '94', __tracer_depth, sep='\0')
    random_num = random.randint(1, 100)  # External call
    print('DECL', 'random_num', random_num, format(id(random_num), 'x'), '94', __tracer_depth, sep='\0')
    print('READ', 'random', random, format(id(random), 'x'), '95', __tracer_depth, sep='\0')
    print('READ', 'numbers', numbers, format(id(numbers), 'x'), '95', __tracer_depth, sep='\0')
    print('EXTERNAL_CALL', 'choice', '95', __tracer_depth, sep='\0')
    random_choice = random.choice(numbers)  # External call
    print('DECL', 'random_choice', random_choice, format(id(random_choice), 'x'), '95', __tracer_depth, sep='\0')
    print(f"Random number: {random_num}")
    print(f"Random choice: {random_choice}")
    
    # File system operations (external)
    print('READ', 'os', os, format(id(os), 'x'), '100', __tracer_depth, sep='\0')
    print('EXTERNAL_CALL', 'getcwd', '100', __tracer_depth, sep='\0')
    current_dir = os.getcwd()  # External call
    print('DECL', 'current_dir', current_dir, format(id(current_dir), 'x'), '100', __tracer_depth, sep='\0')
    print(f"Current directory: {current_dir}")
    
    # Check if file exists (external)
    print('READ', 'os', os, format(id(os), 'x'), '104', __tracer_depth, sep='\0')
    print('READ', '__file__', __file__, format(id(__file__), 'x'), '104', __tracer_depth, sep='\0')
    print('EXTERNAL_CALL', 'exists', '104', __tracer_depth, sep='\0')
    file_exists = os.path.exists(__file__)  # External call
    print('DECL', 'file_exists', file_exists, format(id(file_exists), 'x'), '104', __tracer_depth, sep='\0')
    print(f"This file exists: {file_exists}")
    
    # Nested internal and external calls
    nested_result = multiply(add(2, 3), add(4, 5))  # Internal calls nested
    print('DECL', 'nested_result', nested_result, format(id(nested_result), 'x'), '108', __tracer_depth, sep='\0')
    print(f"Nested result: {nested_result}")  # External call
    
    # JSON operations (external)
    data_dict = {"name": "Test", "value": 42, "active": True}
    print('DECL', 'data_dict', data_dict, format(id(data_dict), 'x'), '112', __tracer_depth, sep='\0')
    print('READ', 'json', json, format(id(json), 'x'), '113', __tracer_depth, sep='\0')
    print('READ', 'data_dict', data_dict, format(id(data_dict), 'x'), '113', __tracer_depth, sep='\0')
    print('EXTERNAL_CALL', 'dumps', '113', __tracer_depth, sep='\0')
    json_string = json.dumps(data_dict)  # External call
    print('DECL', 'json_string', json_string, format(id(json_string), 'x'), '113', __tracer_depth, sep='\0')
    print(f"JSON: {json_string}")
    
    print('READ', 'json', json, format(id(json), 'x'), '116', __tracer_depth, sep='\0')
    print('READ', 'json_string', json_string, format(id(json_string), 'x'), '116', __tracer_depth, sep='\0')
    print('EXTERNAL_CALL', 'loads', '116', __tracer_depth, sep='\0')
    parsed_data = json.loads(json_string)  # External call
    print('DECL', 'parsed_data', parsed_data, format(id(parsed_data), 'x'), '116', __tracer_depth, sep='\0')
    print(f"Parsed: {parsed_data}")
    
    # Text analysis with internal and external calls
    sample_text = "hello world hello python world python"
    print('DECL', 'sample_text', sample_text, format(id(sample_text), 'x'), '120', __tracer_depth, sep='\0')
    print('READ', 'sample_text', sample_text, format(id(sample_text), 'x'), '121', __tracer_depth, sep='\0')
    word_freq = analyze_text(sample_text)  # Internal call that uses external
    print('DECL', 'word_freq', word_freq, format(id(word_freq), 'x'), '121', __tracer_depth, sep='\0')
    print(f"Word frequencies: {word_freq}")
    
    # List comprehension with internal calls
    print('READ', 'x', x, format(id(x), 'x'), '125', __tracer_depth, sep='\0')
    print('READ', 'x', x, format(id(x), 'x'), '125', __tracer_depth, sep='\0')
    print('READ', 'x', x, format(id(x), 'x'), '125', __tracer_depth, sep='\0')
    print('EXTERNAL_CALL', 'range', '125', __tracer_depth, sep='\0')
    squared = [multiply(x, x) for x in range(1, 6)]  # Internal call in comprehension
    print('DECL', 'squared', squared, format(id(squared), 'x'), '125', __tracer_depth, sep='\0')
    print(f"Squared numbers: {squared}")
    
    # Using internal function
    print('READ', 'numbers', numbers, format(id(numbers), 'x'), '129', __tracer_depth, sep='\0')
    processed = process_data(numbers)
    print('DECL', 'processed', processed, format(id(processed), 'x'), '129', __tracer_depth, sep='\0')
    print(f"Processed total: {processed}")
    
    # More external calls
    print('READ', 'numbers', numbers, format(id(numbers), 'x'), '133', __tracer_depth, sep='\0')
    print('EXTERNAL_CALL', 'sorted', '133', __tracer_depth, sep='\0')
    sorted_numbers = sorted(numbers, reverse=True)  # External call
    print('DECL', 'sorted_numbers', sorted_numbers, format(id(sorted_numbers), 'x'), '133', __tracer_depth, sep='\0')
    print('READ', 'numbers', numbers, format(id(numbers), 'x'), '134', __tracer_depth, sep='\0')
    print('EXTERNAL_CALL', 'max', '134', __tracer_depth, sep='\0')
    max_num = max(numbers)  # External call
    print('DECL', 'max_num', max_num, format(id(max_num), 'x'), '134', __tracer_depth, sep='\0')
    print('READ', 'numbers', numbers, format(id(numbers), 'x'), '135', __tracer_depth, sep='\0')
    print('EXTERNAL_CALL', 'min', '135', __tracer_depth, sep='\0')
    min_num = min(numbers)  # External call
    print('DECL', 'min_num', min_num, format(id(min_num), 'x'), '135', __tracer_depth, sep='\0')
    
    print(f"Sorted: {sorted_numbers}")
    print(f"Max: {max_num}, Min: {min_num}")
    
    # Type conversions (external)
    print('EXTERNAL_CALL', 'int', '141', __tracer_depth, sep='\0')
    int_val = int("123")  # External call
    print('DECL', 'int_val', int_val, format(id(int_val), 'x'), '141', __tracer_depth, sep='\0')
    print('EXTERNAL_CALL', 'float', '142', __tracer_depth, sep='\0')
    float_val = float("3.14")  # External call
    print('DECL', 'float_val', float_val, format(id(float_val), 'x'), '142', __tracer_depth, sep='\0')
    print('EXTERNAL_CALL', 'str', '143', __tracer_depth, sep='\0')
    str_val = str(42)  # External call
    print('DECL', 'str_val', str_val, format(id(str_val), 'x'), '143', __tracer_depth, sep='\0')
    
    print(f"Conversions: {int_val}, {float_val}, {str_val}")
    
    print("=== Test Complete ===")

print('CONDITION', '__name__ == "__main__"', __name__ == "__main__", '149', __tracer_depth, sep='\0')
if __name__ == "__main__":
    print('BRANCH', 'if', '__name__ == "__main__"', '150', __tracer_depth, sep='\0')
    main()