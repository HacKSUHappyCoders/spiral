#include <stdio.h>
#include <stdlib.h>

// Simple function with division
int divide(int a, int b) {
    return a / b;  // Runtime error if b is 0
}

// Function that causes array overflow
int access_array(int arr[], int index) {
    return arr[index];  // Runtime error if index out of bounds
}

// Recursive function (can cause stack overflow)
int infinite_loop(int n) {
    return infinite_loop(n + 1);  // Stack overflow
}

int main() {
    printf("Starting error tests...\n");
    
    // Error 1: Division by zero
    int x = 10;
    int y = 0;
    int result = divide(x, y);
    printf("Result: %d\n", result);
    
    // Error 2: Array out of bounds
    int numbers[5] = {1, 2, 3, 4, 5};
    int value = access_array(numbers, 100);
    printf("Value: %d\n", value);
    
    // Error 3: NULL pointer dereference
    int* ptr = NULL;
    printf("Dereferencing NULL: %d\n", *ptr);
    
    // Error 4: Use after free
    char* str = (char*)malloc(10);
    free(str);
    printf("Using freed memory: %s\n", str);
    
    // Error 5: Buffer overflow
    char buffer[5];
    strcpy(buffer, "This is way too long for the buffer!");
    printf("Buffer: %s\n", buffer);
    
    // Error 6: Stack overflow (infinite recursion)
    int overflow = infinite_loop(0);
    printf("Overflow: %d\n", overflow);
    
    return 0;
}
