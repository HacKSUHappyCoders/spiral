int __stack_depth = 0;
#include <stdio.h>
#include <stdlib.h>

// Simple function with division
int divide(int a, int b) {
    __stack_depth++;
    printf("%s", "CALL"); putchar(0); printf("%s", "divide"); putchar(0); printf("%d", a); putchar(0); printf("%d", b); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "PARAM"); putchar(0); printf("%s", "a"); putchar(0); printf("%d", a); putchar(0); printf("%s", "5"); putchar('\n');
    printf("%s", "PARAM"); putchar(0); printf("%s", "b"); putchar(0); printf("%d", b); putchar(0); printf("%s", "5"); putchar('\n');
    __stack_depth--;
    return a / b;  // Runtime error if b is 0
}

// Function that causes array overflow
int access_array(int arr[], int index) {
    __stack_depth++;
    printf("%s", "CALL"); putchar(0); printf("%s", "access_array"); putchar(0); printf("%p", arr); putchar(0); printf("%d", index); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "PARAM"); putchar(0); printf("%s", "arr"); putchar(0); printf("%p", arr); putchar(0); printf("%s", "10"); putchar('\n');
    printf("%s", "PARAM"); putchar(0); printf("%s", "index"); putchar(0); printf("%d", index); putchar(0); printf("%s", "10"); putchar('\n');
    __stack_depth--;
    return arr[index];  // Runtime error if index out of bounds
}

// Recursive function (can cause stack overflow)
int infinite_loop(int n) {
    __stack_depth++;
    printf("%s", "CALL"); putchar(0); printf("%s", "infinite_loop"); putchar(0); printf("%d", n); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "PARAM"); putchar(0); printf("%s", "n"); putchar(0); printf("%d", n); putchar(0); printf("%s", "15"); putchar('\n');
    __stack_depth--;
    return infinite_loop(n + 1);  // Stack overflow
}

int main() {
    setbuf(stdout, NULL);
    printf("%s", "META"); putchar(0); printf("%s", "file_name"); putchar(0); printf("%s", "runtime.c"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "file_path"); putchar(0); printf("%s", "/srv/mosiacs/data/runtime.c"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "file_size"); putchar(0); printf("%s", "1378"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "file_mode"); putchar(0); printf("%s", "-rwxrwxrwx"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "modified"); putchar(0); printf("%s", "2026-02-07 20:42:49"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "accessed"); putchar(0); printf("%s", "2026-02-07 20:49:39"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "created"); putchar(0); printf("%s", "2026-02-07 20:49:39"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "language"); putchar(0); printf("%s", "C"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "total_lines"); putchar(0); printf("%s", "53"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "non_blank_lines"); putchar(0); printf("%s", "41"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_includes"); putchar(0); printf("%s", "2"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_comments"); putchar(0); printf("%s", "12"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_functions"); putchar(0); printf("%s", "4"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "function_names"); putchar(0); printf("%s", "divide,access_array,infinite_loop,main"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_variables"); putchar(0); printf("%s", "13"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_assignments"); putchar(0); printf("%s", "0"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_calls"); putchar(0); printf("%s", "14"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_returns"); putchar(0); printf("%s", "4"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_loops"); putchar(0); printf("%s", "0"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_branches"); putchar(0); printf("%s", "0"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "max_nesting_depth"); putchar(0); printf("%s", "1"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "includes"); putchar(0); printf("%s", "stdio.h,stdlib.h"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "defined_functions"); putchar(0); printf("%s", "access_array,divide,infinite_loop,main"); putchar('\n');
    __stack_depth++;
    printf("%s", "CALL"); putchar(0); printf("%s", "main"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("Starting error tests...\n");
    
    // Error 1: Division by zero
    int x = 10;
    printf("%s", "DECL"); putchar(0); printf("%s", "x"); putchar(0); printf("%d", x); putchar(0); printf("%p", &x); putchar(0); printf("%s", "23"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    int y = 0;
    printf("%s", "DECL"); putchar(0); printf("%s", "y"); putchar(0); printf("%d", y); putchar(0); printf("%p", &y); putchar(0); printf("%s", "24"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "READ"); putchar(0); printf("%s", "x"); putchar(0); printf("%d", x); putchar(0); printf("%p", &x); putchar(0); printf("%s", "25"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "READ"); putchar(0); printf("%s", "y"); putchar(0); printf("%d", y); putchar(0); printf("%p", &y); putchar(0); printf("%s", "25"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    int result = divide(x, y);
    printf("%s", "DECL"); putchar(0); printf("%s", "result"); putchar(0); printf("%d", result); putchar(0); printf("%p", &result); putchar(0); printf("%s", "25"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("Result: %d\n", result);
    
    // Error 2: Array out of bounds
    int numbers[5] = {1, 2, 3, 4, 5};
    printf("%s", "DECL"); putchar(0); printf("%s", "numbers"); putchar(0); printf("%p", numbers); putchar(0); printf("%p", &numbers); putchar(0); printf("%s", "29"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "READ"); putchar(0); printf("%s", "numbers"); putchar(0); printf("%p", numbers); putchar(0); printf("%p", &numbers); putchar(0); printf("%s", "30"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    int value = access_array(numbers, 100);
    printf("%s", "DECL"); putchar(0); printf("%s", "value"); putchar(0); printf("%d", value); putchar(0); printf("%p", &value); putchar(0); printf("%s", "30"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("Value: %d\n", value);
    
    // Error 3: NULL pointer dereference
    int* ptr = NULL;
    printf("%s", "DECL"); putchar(0); printf("%s", "ptr"); putchar(0); printf("%p", ptr); putchar(0); printf("%p", &ptr); putchar(0); printf("%s", "34"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("Dereferencing NULL: %d\n", *ptr);
    
    // Error 4: Use after free
    printf("%s", "EXTERNAL_CALL"); putchar(0); printf("%s", "malloc"); putchar(0); printf("%s", "38"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    char* str = (char*)malloc(10);
    printf("%s", "DECL"); putchar(0); printf("%s", "str"); putchar(0); printf("%s", str); putchar(0); printf("%p", &str); putchar(0); printf("%s", "38"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "EXTERNAL_CALL"); putchar(0); printf("%s", "free"); putchar(0); printf("%s", "39"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    free(str);
    printf("Using freed memory: %s\n", str);
    
    // Error 5: Buffer overflow
    char buffer[5];
    printf("%s", "EXTERNAL_CALL"); putchar(0); printf("%s", "strcpy"); putchar(0); printf("%s", "44"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    strcpy(buffer, "This is way too long for the buffer!");
    printf("Buffer: %s\n", buffer);
    
    // Error 6: Stack overflow (infinite recursion)
    int overflow = infinite_loop(0);
    printf("%s", "DECL"); putchar(0); printf("%s", "overflow"); putchar(0); printf("%d", overflow); putchar(0); printf("%p", &overflow); putchar(0); printf("%s", "48"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("Overflow: %d\n", overflow);
    
    printf("%s", "RETURN"); putchar(0); printf("%s", "literal"); putchar(0); printf("%s", "0"); putchar(0); printf("%s", "0"); putchar(0); printf("%s", "51"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    __stack_depth--;
    return 0;
}