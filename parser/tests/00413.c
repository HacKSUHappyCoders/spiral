#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <time.h>

// Forward declarations for mutual recursion
int isEven(int n);
int isOdd(int n);

// Mutually recursive functions
int isEven(int n) {
    if (n == 0) {
        return 1;
    }
    return isOdd(n - 1);
}

int isOdd(int n) {
    if (n == 0) {
        return 0;
    }
    return isEven(n - 1);
}

// Recursive factorial function
int factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

// Helper function that's called by other functions
int multiply(int a, int b) {
    int result = 0;
    for (int i = 0; i < b; i++) {
        result = result + a;
    }
    return result;
}

// Internal helper functions from 00013.c
int add(int a, int b) {
    return a + b;
}

double calculate_average(int arr[], int size) {
    int sum = 0;
    for (int i = 0; i < size; i++) {
        sum = add(sum, arr[i]);  // Internal call
    }
    return (double)sum / size;
}

void print_array(int arr[], int size) {
    printf("Array contents: ");  // External call (printf)
    for (int i = 0; i < size; i++) {
        printf("%d ", arr[i]);  // External call
    }
    printf("\n");  // External call
}

char* create_message(const char* name) {
    // Using malloc (external) and sprintf (external)
    char* msg = (char*)malloc(100 * sizeof(char));
    sprintf(msg, "Hello, %s!", name);
    return msg;
}

// Function that uses loops and calls other functions
int power(int base, int exp) {
    int result = 1;
    int counter = 0;
    
    while (counter < exp) {
        result = multiply(result, base);
        counter = counter + 1;
    }
    
    return result;
}

// Function with nested loops
int sumMatrix(int size) {
    int sum = 0;
    int i = 0;
    
    while (i < size) {
        int j = 0;
        for (j = 0; j < size; j++) {
            sum = sum + i * size + j;
        }
        i = i + 1;
    }
    
    return sum;
}

// Function with multiple return paths
int classify(int num) {
    if (num < 0) {
        return -1;
    } else if (num == 0) {
        return 0;
    } else {
        return 1;
    }
}

// Function with complex nested conditionals
int complexLogic(int a, int b, int c) {
    int result = 0;
    
    if (a > 0) {
        if (b > 0) {
            if (c > 0) {
                result = a + b + c;
            } else {
                result = a + b - c;
            }
        } else {
            if (c > 0) {
                result = a - b + c;
            } else {
                result = a - b - c;
            }
        }
    } else {
        if (b > 0) {
            result = b + c;
        } else {
            result = c;
        }
    }
    
    return result;
}

// Function that calls multiple other functions
int compute(int x, int y) {
    int a = factorial(x);
    int b = power(2, y);
    int c = multiply(a, b);
    
    if (c > 100) {
        c = c - 50;
    } else {
        c = c + 50;
    }
    
    return c;
}

// Function with triple nested loops
int tripleNested(int size) {
    int total = 0;
    
    for (int i = 0; i < size; i++) {
        for (int j = 0; j < size; j++) {
            for (int k = 0; k < size; k++) {
                total = total + i + j + k;
            }
        }
    }
    
    return total;
}

// Function with mixed loop types
int mixedLoops(int n) {
    int sum = 0;
    int i = 0;
    
    while (i < n) {
        for (int j = 0; j < n; j++) {
            int k = 0;
            while (k < j) {
                sum = sum + 1;
                k = k + 1;
            }
        }
        i = i + 1;
    }
    
    return sum;
}

// Function with early returns in loops
int findFirst(int target, int max) {
    for (int i = 0; i < max; i++) {
        if (i == target) {
            return i;
        }
        
        if (i > target + 5) {
            return -1;
        }
    }
    
    return -2;
}

// Function with many parameters
int multiParam(int a, int b, int c, int d, int e) {
    int result = a + b;
    result = result * c;
    result = result - d;
    result = result / e;
    return result;
}

int main() {
    printf("=== Combined Test: Internal, External, and Recursive Functions ===\n");
    
    // Mix of operations - not grouped by type
    int sum = add(5, 3);
    int matrix = sumMatrix(3);
    printf("Sum: %d\n", sum);
    
    // Array operations mixed with other calls
    int numbers[] = {10, 20, 30, 40, 50};
    int size = 5;
    int cls = classify(-5);
    
    print_array(numbers, size);
    printf("Classify(-5): %d\n", cls);
    
    // String operations interspersed
    char str1[50] = "Hello";
    int product = multiply(4, 7);
    char str2[50] = "World";
    
    printf("Product: %d\n", product);
    int len1 = strlen(str1);
    printf("Length of '%s': %d\n", str1, len1);
    
    // Test mutual recursion early
    int evenCheck = isEven(4);
    
    char combined[100];
    strcpy(combined, str1);
    strcat(combined, " ");
    strcat(combined, str2);
    
    int oddCheck = isOdd(3);
    printf("Combined: %s\n", combined);
    printf("Is 4 even? %d, Is 3 odd? %d\n", evenCheck, oddCheck);
    
    // Math operations scattered
    double x = 16.0;
    int triple = tripleNested(2);
    double square_root = sqrt(x);
    
    printf("Square root of %.0f: %.2f\n", x, square_root);
    printf("Triple nested sum: %d\n", triple);
    
    // Random number and power mixed
    int random_num = rand() % 100;
    int pow_val = power(2, 3);
    printf("Random number: %d\n", random_num);
    printf("2^3 = %d\n", pow_val);
    
    // Average calculation
    double avg = calculate_average(numbers, size);
    double pow_result = pow(2.0, 3.0);
    printf("Average: %.2f\n", avg);
    printf("2^3: %.0f\n", pow_result);
    
    // Message creation
    char* greeting = create_message("Developer");
    int found = findFirst(3, 10);
    printf("%s\n", greeting);
    free(greeting);
    printf("Find first result: %d\n", found);
    
    // Factorial and compute
    int n = 3;
    int fact = factorial(n);
    printf("Factorial of %d: %d\n", n, fact);
    
    int result = compute(3, 2);
    int mixed = mixedLoops(3);
    printf("Compute(3, 2): %d\n", result);
    printf("Mixed loops result: %d\n", mixed);
    
    // Complex logic and multi-param
    int complex = complexLogic(5, -3, 2);
    int multi = multiParam(10, 2, 3, 4, 2);
    printf("Complex logic result: %d\n", complex);
    printf("Multi-param result: %d\n", multi);
    
    // Time call at the end
    time_t current_time = time(NULL);
    
    // Loop with break early
    int check = 0;
    while (1) {
        check = check + 1;
        if (check >= 5) {
            break;
        }
        
        if (check == 2) {
            check = check + 1;
        }
    }
    
    // Nested internal calls
    int nested_result = multiply(add(2, 3), add(4, 5));
    printf("Nested internal calls: %d\n", nested_result);
    
    // While loop with complex condition
    int counter = 0;
    int limit = 10;
    while (counter < limit && result < 1000) {
        counter = counter + 1;
        result = result + 2;
        
        if (counter > 5) {
            int temp = counter * 2;
            result = result - temp;
        }
    }
    
    // Nested loops with complex bodies
    for (int outer = 0; outer < 3; outer++) {
        int inner_sum = 0;
        for (int inner = 0; inner < 2; inner++) {
            inner_sum = inner_sum + inner;
            
            if (inner_sum > 1) {
                inner_sum = inner_sum / 2;
            }
        }
        result = result + inner_sum;
    }
    
    // Final computation chain
    int final = multiply(result, 2);
    final = power(2, 4);
    final = factorial(3);
    
    // Multiple levels of if-else
    if (result > 500) {
        if (result > 750) {
            result = result - 100;
        } else {
            result = result - 50;
        }
    } else if (result > 250) {
        result = result + 50;
    } else {
        if (result < 100) {
            result = result + 100;
        }
    }
    
    printf("Final result: %d\n", result + final);
    
    return result + final;
}
