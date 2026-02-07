#include <stdio.h>

int __stack_depth = 0;
int main() {
    setbuf(stdout, NULL);
    printf("%s", "META"); putchar(0); printf("%s", "file_name"); putchar(0); printf("%s", "00002.c"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "file_path"); putchar(0); printf("%s", "/srv/mosiacs/data/00002.c"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "file_size"); putchar(0); printf("%s", "173"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "file_mode"); putchar(0); printf("%s", "-rwxrwxrwx"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "modified"); putchar(0); printf("%s", "2026-02-07 20:19:28"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "accessed"); putchar(0); printf("%s", "2026-02-07 20:27:24"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "created"); putchar(0); printf("%s", "2026-02-07 20:19:28"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "language"); putchar(0); printf("%s", "C"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "total_lines"); putchar(0); printf("%s", "16"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "non_blank_lines"); putchar(0); printf("%s", "12"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_includes"); putchar(0); printf("%s", "0"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_comments"); putchar(0); printf("%s", "0"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_functions"); putchar(0); printf("%s", "1"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "function_names"); putchar(0); printf("%s", "main"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_variables"); putchar(0); printf("%s", "1"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_assignments"); putchar(0); printf("%s", "3"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_calls"); putchar(0); printf("%s", "0"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_returns"); putchar(0); printf("%s", "1"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_loops"); putchar(0); printf("%s", "1"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "num_branches"); putchar(0); printf("%s", "1"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "max_nesting_depth"); putchar(0); printf("%s", "2"); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "includes"); putchar(0); printf("%s", ""); putchar('\n');
    printf("%s", "META"); putchar(0); printf("%s", "defined_functions"); putchar(0); printf("%s", "main"); putchar('\n');
    __stack_depth++;
    printf("%s", "CALL"); putchar(0); printf("%s", "main"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    int x = 10;
    printf("%s", "DECL"); putchar(0); printf("%s", "x"); putchar(0); printf("%d", x); putchar(0); printf("%p", &x); putchar(0); printf("%s", "2"); putchar(0); printf("%d", __stack_depth); putchar('\n');

    while (x > 0) {
    printf("%s", "LOOP"); putchar(0); printf("%s", "while"); putchar(0); printf("%s", "x > 0"); putchar(0); printf("%d", (x > 0)); putchar(0); printf("%s", "4"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("%s", "READ"); putchar(0); printf("%s", "x"); putchar(0); printf("%d", x); putchar(0); printf("%p", &x); putchar(0); printf("%s", "5"); putchar(0); printf("%d", __stack_depth); putchar('\n');
        x -= 3;
    printf("%s", "ASSIGN"); putchar(0); printf("%s", "x"); putchar(0); printf("%d", x); putchar(0); printf("%p", &x); putchar(0); printf("%s", "5"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    }

    printf("%s", "CONDITION"); putchar(0); printf("%s", "x > 0"); putchar(0); printf("%d", (x > 0)); putchar(0); printf("%s", "8"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    if (x > 0) {
    printf("%s", "BRANCH"); putchar(0); printf("%s", "if"); putchar(0); printf("%s", "x > 0"); putchar(0); printf("%s", "8"); putchar(0); printf("%d", __stack_depth); putchar('\n');
        x = 100;
    printf("%s", "ASSIGN"); putchar(0); printf("%s", "x"); putchar(0); printf("%d", x); putchar(0); printf("%p", &x); putchar(0); printf("%s", "9"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    } else {
    printf("%s", "BRANCH"); putchar(0); printf("%s", "else"); putchar(0); printf("%s", "x > 0"); putchar(0); printf("%s", "8"); putchar(0); printf("%d", __stack_depth); putchar('\n');
        x = 0;
    printf("%s", "ASSIGN"); putchar(0); printf("%s", "x"); putchar(0); printf("%d", x); putchar(0); printf("%p", &x); putchar(0); printf("%s", "11"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    }

    printf("%s", "RETURN"); putchar(0); printf("%s", "x"); putchar(0); printf("%d", x); putchar(0); printf("%p", &x); putchar(0); printf("%s", "14"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    __stack_depth--;
    return x;
}