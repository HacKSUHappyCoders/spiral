int __stack_depth = 0;
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <time.h>

// Internal helper functions defined in this file
int add(int a, int b) {
    __stack_depth++;
    printf("%s", "CALL"); putchar(0); printf("%s", "add"); putchar(0); printf("%d", a); putchar(0); printf("%d", b); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "PARAM"); putchar(0); printf("%s", "a"); putchar(0); printf("%d", a); putchar(0); printf("%s", "8"); putchar('\n');
    printf("%s", "PARAM"); putchar(0); printf("%s", "b"); putchar(0); printf("%d", b); putchar(0); printf("%s", "8"); putchar('\n');
    __stack_depth--;
    return a + b;
}

int multiply(int x, int y) {
    __stack_depth++;
    printf("%s", "CALL"); putchar(0); printf("%s", "multiply"); putchar(0); printf("%d", x); putchar(0); printf("%d", y); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "PARAM"); putchar(0); printf("%s", "x"); putchar(0); printf("%d", x); putchar(0); printf("%s", "12"); putchar('\n');
    printf("%s", "PARAM"); putchar(0); printf("%s", "y"); putchar(0); printf("%d", y); putchar(0); printf("%s", "12"); putchar('\n');
    printf("%s", "READ"); putchar(0); printf("%s", "x"); putchar(0); printf("%d", x); putchar(0); printf("%p", &x); putchar(0); printf("%s", "13"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "READ"); putchar(0); printf("%s", "y"); putchar(0); printf("%d", y); putchar(0); printf("%p", &y); putchar(0); printf("%s", "13"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    int result = x * y;
    printf("%s", "DECL"); putchar(0); printf("%s", "result"); putchar(0); printf("%d", result); putchar(0); printf("%p", &result); putchar(0); printf("%s", "13"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "RETURN"); putchar(0); printf("%s", "result"); putchar(0); printf("%d", result); putchar(0); printf("%p", &result); putchar(0); printf("%s", "14"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    __stack_depth--;
    return result;
}

double calculate_average(int arr[], int size) {
    __stack_depth++;
    printf("%s", "CALL"); putchar(0); printf("%s", "calculate_average"); putchar(0); printf("%p", arr); putchar(0); printf("%d", size); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "PARAM"); putchar(0); printf("%s", "arr"); putchar(0); printf("%p", arr); putchar(0); printf("%s", "17"); putchar('\n');
    printf("%s", "PARAM"); putchar(0); printf("%s", "size"); putchar(0); printf("%d", size); putchar(0); printf("%s", "17"); putchar('\n');
    int sum = 0;
    printf("%s", "DECL"); putchar(0); printf("%s", "sum"); putchar(0); printf("%d", sum); putchar(0); printf("%p", &sum); putchar(0); printf("%s", "18"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    for (int i = 0; i < size; i++) {
    printf("%s", "LOOP"); putchar(0); printf("%s", "for"); putchar(0); printf("%s", "i < size"); putchar(0); printf("%d", i < size); putchar(0); printf("%s", "19"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "DECL"); putchar(0); printf("%s", "i"); putchar(0); printf("%d", i); putchar(0); printf("%p", &i); putchar(0); printf("%s", "19"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "READ"); putchar(0); printf("%s", "sum"); putchar(0); printf("%d", sum); putchar(0); printf("%p", &sum); putchar(0); printf("%s", "20"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "READ"); putchar(0); printf("%s", "arr"); putchar(0); printf("%p", arr); putchar(0); printf("%p", &arr); putchar(0); printf("%s", "20"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "READ"); putchar(0); printf("%s", "i"); putchar(0); printf("%d", i); putchar(0); printf("%p", &i); putchar(0); printf("%s", "20"); putchar(0); printf("%d", __stack_depth); putchar('\n');
        sum = add(sum, arr[i]);  // Internal call
    printf("%s", "ASSIGN"); putchar(0); printf("%s", "sum"); putchar(0); printf("%d", sum); putchar(0); printf("%p", &sum); putchar(0); printf("%s", "20"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    }
    __stack_depth--;
    return (double)sum / size;
}

void print_array(int arr[], int size) {
    __stack_depth++;
    printf("%s", "CALL"); putchar(0); printf("%s", "print_array"); putchar(0); printf("%p", arr); putchar(0); printf("%d", size); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "PARAM"); putchar(0); printf("%s", "arr"); putchar(0); printf("%p", arr); putchar(0); printf("%s", "25"); putchar('\n');
    printf("%s", "PARAM"); putchar(0); printf("%s", "size"); putchar(0); printf("%d", size); putchar(0); printf("%s", "25"); putchar('\n');
    printf("Array contents: ");  // External call (printf)
    for (int i = 0; i < size; i++) {
    printf("%s", "LOOP"); putchar(0); printf("%s", "for"); putchar(0); printf("%s", "i < size"); putchar(0); printf("%d", i < size); putchar(0); printf("%s", "27"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "DECL"); putchar(0); printf("%s", "i"); putchar(0); printf("%d", i); putchar(0); printf("%p", &i); putchar(0); printf("%s", "27"); putchar(0); printf("%d", __stack_depth); putchar('\n');
        printf("%d ", arr[i]);  // External call
    }
    printf("\n");  // External call
}

char* create_message(const char* name) {
    printf("%s", "PARAM"); putchar(0); printf("%s", "name"); putchar(0); printf("%s", name); putchar(0); printf("%s", "33"); putchar('\n');
    // Using malloc (external) and sprintf (external)
    printf("%s", "EXTERNAL_CALL"); putchar(0); printf("%s", "malloc"); putchar(0); printf("%s", "35"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    char* msg = (char*)malloc(100 * sizeof(char));
    printf("%s", "DECL"); putchar(0); printf("%s", "msg"); putchar(0); printf("%s", msg); putchar(0); printf("%p", &msg); putchar(0); printf("%s", "35"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "EXTERNAL_CALL"); putchar(0); printf("%s", "sprintf"); putchar(0); printf("%s", "36"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    sprintf(msg, "Hello, %s!", name);
    printf("%s", "RETURN"); putchar(0); printf("%s", "msg"); putchar(0); printf("%s", msg); putchar(0); printf("%p", &msg); putchar(0); printf("%s", "37"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    __stack_depth--;
    return msg;
}

int main() {
    setbuf(stdout, NULL);
    printf("%s", "META"); putchar(0); printf("%s", "file_name"); putchar(0); printf("%s", "00013.c"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "file_path"); putchar(0); printf("%s", "/srv/mosiacs/data/00013.c"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "file_size"); putchar(0); printf("%s", "2914"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "file_mode"); putchar(0); printf("%s", "-rwxrwxrwx"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "modified"); putchar(0); printf("%s", "2026-02-07 20:19:13"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "accessed"); putchar(0); printf("%s", "2026-02-07 20:34:35"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "created"); putchar(0); printf("%s", "2026-02-07 20:19:13"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "language"); putchar(0); printf("%s", "C"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "total_lines"); putchar(0); printf("%s", "105"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "non_blank_lines"); putchar(0); printf("%s", "82"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_includes"); putchar(0); printf("%s", "5"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_comments"); putchar(0); printf("%s", "28"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_functions"); putchar(0); printf("%s", "6"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "function_names"); putchar(0); printf("%s", "add,multiply,calculate_average,print_array,create_message,main"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_variables"); putchar(0); printf("%s", "30"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_assignments"); putchar(0); printf("%s", "3"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_calls"); putchar(0); printf("%s", "35"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_returns"); putchar(0); printf("%s", "5"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_loops"); putchar(0); printf("%s", "2"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_branches"); putchar(0); printf("%s", "0"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "max_nesting_depth"); putchar(0); printf("%s", "2"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "includes"); putchar(0); printf("%s", "stdio.h,stdlib.h,string.h,math.h,time.h"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "defined_functions"); putchar(0); printf("%s", "add,calculate_average,create_message,main,multiply,print_array"); putchar('\n');
    __stack_depth++;
    printf("%s", "CALL"); putchar(0); printf("%s", "main"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    // External call to time
    printf("%s", "EXTERNAL_CALL"); putchar(0); printf("%s", "time"); putchar(0); printf("%s", "42"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    time_t current_time = time(NULL);
    printf("%s", "DECL"); putchar(0); printf("%s", "current_time"); putchar(0); printf("%d", current_time); putchar(0); printf("%p", &current_time); putchar(0); printf("%s", "42"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    
    // External call to printf
    printf("=== Testing Internal and External Function Calls ===\n");
    
    // Internal function calls
    int sum = add(5, 3);
    printf("%s", "DECL"); putchar(0); printf("%s", "sum"); putchar(0); printf("%d", sum); putchar(0); printf("%p", &sum); putchar(0); printf("%s", "48"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    int product = multiply(4, 7);
    printf("%s", "DECL"); putchar(0); printf("%s", "product"); putchar(0); printf("%d", product); putchar(0); printf("%p", &product); putchar(0); printf("%s", "49"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    
    printf("Sum: %d\n", sum);  // External call
    printf("Product: %d\n", product);  // External call
    
    // Array operations
    int numbers[] = {10, 20, 30, 40, 50};
    printf("%s", "DECL"); putchar(0); printf("%s", "numbers"); putchar(0); printf("%p", numbers); putchar(0); printf("%p", &numbers); putchar(0); printf("%s", "55"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    int size = 5;
    printf("%s", "DECL"); putchar(0); printf("%s", "size"); putchar(0); printf("%d", size); putchar(0); printf("%p", &size); putchar(0); printf("%s", "56"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    
    // Internal call
    print_array(numbers, size);
    
    // Internal call that uses external functions
    printf("%s", "READ"); putchar(0); printf("%s", "numbers"); putchar(0); printf("%p", numbers); putchar(0); printf("%p", &numbers); putchar(0); printf("%s", "62"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "READ"); putchar(0); printf("%s", "size"); putchar(0); printf("%d", size); putchar(0); printf("%p", &size); putchar(0); printf("%s", "62"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    double avg = calculate_average(numbers, size);
    printf("%s", "DECL"); putchar(0); printf("%s", "avg"); putchar(0); printf("%lf", avg); putchar(0); printf("%p", &avg); putchar(0); printf("%s", "62"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("Average: %.2f\n", avg);  // External call
    
    // String operations with external functions
    char str1[50] = "Hello";
    printf("%s", "DECL"); putchar(0); printf("%s", "str1"); putchar(0); printf("%s", str1); putchar(0); printf("%p", &str1); putchar(0); printf("%s", "66"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    char str2[50] = "World";
    printf("%s", "DECL"); putchar(0); printf("%s", "str2"); putchar(0); printf("%s", str2); putchar(0); printf("%p", &str2); putchar(0); printf("%s", "67"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    
    // External calls (strlen, strcat, strcpy)
    printf("%s", "READ"); putchar(0); printf("%s", "str1"); putchar(0); printf("%s", str1); putchar(0); printf("%p", &str1); putchar(0); printf("%s", "70"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "EXTERNAL_CALL"); putchar(0); printf("%s", "strlen"); putchar(0); printf("%s", "70"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    int len1 = strlen(str1);
    printf("%s", "DECL"); putchar(0); printf("%s", "len1"); putchar(0); printf("%d", len1); putchar(0); printf("%p", &len1); putchar(0); printf("%s", "70"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "READ"); putchar(0); printf("%s", "str2"); putchar(0); printf("%s", str2); putchar(0); printf("%p", &str2); putchar(0); printf("%s", "71"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "EXTERNAL_CALL"); putchar(0); printf("%s", "strlen"); putchar(0); printf("%s", "71"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    int len2 = strlen(str2);
    printf("%s", "DECL"); putchar(0); printf("%s", "len2"); putchar(0); printf("%d", len2); putchar(0); printf("%p", &len2); putchar(0); printf("%s", "71"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("Length of '%s': %d\n", str1, len1);
    
    char combined[100];
    printf("%s", "EXTERNAL_CALL"); putchar(0); printf("%s", "strcpy"); putchar(0); printf("%s", "75"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    strcpy(combined, str1);
    printf("%s", "EXTERNAL_CALL"); putchar(0); printf("%s", "strcat"); putchar(0); printf("%s", "76"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    strcat(combined, " ");
    printf("%s", "EXTERNAL_CALL"); putchar(0); printf("%s", "strcat"); putchar(0); printf("%s", "77"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    strcat(combined, str2);
    printf("Combined: %s\n", combined);
    
    // Math library external calls
    double x = 16.0;
    printf("%s", "DECL"); putchar(0); printf("%s", "x"); putchar(0); printf("%lf", x); putchar(0); printf("%p", &x); putchar(0); printf("%s", "81"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "READ"); putchar(0); printf("%s", "x"); putchar(0); printf("%lf", x); putchar(0); printf("%p", &x); putchar(0); printf("%s", "82"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "EXTERNAL_CALL"); putchar(0); printf("%s", "sqrt"); putchar(0); printf("%s", "82"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    double square_root = sqrt(x);  // External call
    printf("%s", "DECL"); putchar(0); printf("%s", "square_root"); putchar(0); printf("%lf", square_root); putchar(0); printf("%p", &square_root); putchar(0); printf("%s", "82"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "EXTERNAL_CALL"); putchar(0); printf("%s", "pow"); putchar(0); printf("%s", "83"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    double power = pow(2.0, 3.0);  // External call
    printf("%s", "DECL"); putchar(0); printf("%s", "power"); putchar(0); printf("%lf", power); putchar(0); printf("%p", &power); putchar(0); printf("%s", "83"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    
    printf("Square root of %.0f: %.2f\n", x, square_root);
    printf("2^3: %.0f\n", power);
    
    // Internal function call
    char* greeting = create_message("Developer");
    printf("%s", "DECL"); putchar(0); printf("%s", "greeting"); putchar(0); printf("%s", greeting); putchar(0); printf("%p", &greeting); putchar(0); printf("%s", "89"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s\n", greeting);  // External call
    
    // External call to free
    printf("%s", "EXTERNAL_CALL"); putchar(0); printf("%s", "free"); putchar(0); printf("%s", "93"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    free(greeting);
    
    // More external calls
    printf("%s", "EXTERNAL_CALL"); putchar(0); printf("%s", "rand"); putchar(0); printf("%s", "96"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    int random_num = rand() % 100;  // External call
    printf("%s", "DECL"); putchar(0); printf("%s", "random_num"); putchar(0); printf("%d", random_num); putchar(0); printf("%p", &random_num); putchar(0); printf("%s", "96"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("Random number: %d\n", random_num);
    
    // Nested internal and external calls
    int nested_result = multiply(add(2, 3), add(4, 5));  // Internal calls nested
    printf("%s", "DECL"); putchar(0); printf("%s", "nested_result"); putchar(0); printf("%d", nested_result); putchar(0); printf("%p", &nested_result); putchar(0); printf("%s", "100"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("Nested result: %d\n", nested_result);  // External call
    
    printf("%s", "RETURN"); putchar(0); printf("%s", "literal"); putchar(0); printf("%s", "0"); putchar(0); printf("%s", "0"); putchar(0); printf("%s", "103"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    __stack_depth--;
    return 0;
}