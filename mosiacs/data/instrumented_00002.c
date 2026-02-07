int __stack_depth = 0;
int main() {
    printf("META"); putchar(0); printf("file_name"); putchar(0); printf("00002.c"); putchar('\n');
    printf("META"); putchar(0); printf("file_path"); putchar(0); printf("/srv/mosiacs/data/00002.c"); putchar('\n');
    printf("META"); putchar(0); printf("file_size"); putchar(0); printf("158"); putchar('\n');
    printf("META"); putchar(0); printf("file_mode"); putchar(0); printf("-rwxrwxrwx"); putchar('\n');
    printf("META"); putchar(0); printf("modified"); putchar(0); printf("2026-02-07 19:56:56"); putchar('\n');
    printf("META"); putchar(0); printf("accessed"); putchar(0); printf("2026-02-07 19:56:56"); putchar('\n');
    printf("META"); putchar(0); printf("created"); putchar(0); printf("2026-02-07 19:56:56"); putchar('\n');
    printf("META"); putchar(0); printf("language"); putchar(0); printf("C"); putchar('\n');
    printf("META"); putchar(0); printf("total_lines"); putchar(0); printf("16"); putchar('\n');
    printf("META"); putchar(0); printf("non_blank_lines"); putchar(0); printf("12"); putchar('\n');
    printf("META"); putchar(0); printf("num_includes"); putchar(0); printf("0"); putchar('\n');
    printf("META"); putchar(0); printf("num_comments"); putchar(0); printf("0"); putchar('\n');
    printf("META"); putchar(0); printf("num_functions"); putchar(0); printf("1"); putchar('\n');
    printf("META"); putchar(0); printf("function_names"); putchar(0); printf("main"); putchar('\n');
    printf("META"); putchar(0); printf("num_variables"); putchar(0); printf("1"); putchar('\n');
    printf("META"); putchar(0); printf("num_assignments"); putchar(0); printf("3"); putchar('\n');
    printf("META"); putchar(0); printf("num_calls"); putchar(0); printf("0"); putchar('\n');
    printf("META"); putchar(0); printf("num_returns"); putchar(0); printf("1"); putchar('\n');
    printf("META"); putchar(0); printf("num_loops"); putchar(0); printf("1"); putchar('\n');
    printf("META"); putchar(0); printf("num_branches"); putchar(0); printf("1"); putchar('\n');
    printf("META"); putchar(0); printf("max_nesting_depth"); putchar(0); printf("2"); putchar('\n');
    __stack_depth++;
    printf("CALL"); putchar(0); printf("main"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    int x = 10;
    printf("DECL"); putchar(0); printf("x"); putchar(0); printf("%d", x); putchar(0); printf("%p", &x); putchar(0); printf("2"); putchar(0); printf("%d", __stack_depth); putchar('\n');

    while (x > 0) {
    printf("LOOP"); putchar(0); printf("while"); putchar(0); printf("x > 0"); putchar(0); printf("%d", (x > 0)); putchar(0); printf("4"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    printf("READ"); putchar(0); printf("x"); putchar(0); printf("%d", x); putchar(0); printf("%p", &x); putchar(0); printf("5"); putchar(0); printf("%d", __stack_depth); putchar('\n');
        x -= 3;
    printf("ASSIGN"); putchar(0); printf("x"); putchar(0); printf("%d", x); putchar(0); printf("%p", &x); putchar(0); printf("5"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    }

    printf("CONDITION"); putchar(0); printf("x > 0"); putchar(0); printf("%d", (x > 0)); putchar(0); printf("8"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    if (x > 0) {
    printf("BRANCH"); putchar(0); printf("if"); putchar(0); printf("x > 0"); putchar(0); printf("8"); putchar(0); printf("%d", __stack_depth); putchar('\n');
        x = 100;
    printf("ASSIGN"); putchar(0); printf("x"); putchar(0); printf("%d", x); putchar(0); printf("%p", &x); putchar(0); printf("9"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    } else {
    printf("BRANCH"); putchar(0); printf("else"); putchar(0); printf("x > 0"); putchar(0); printf("8"); putchar(0); printf("%d", __stack_depth); putchar('\n');
        x = 0;
    printf("ASSIGN"); putchar(0); printf("x"); putchar(0); printf("%d", x); putchar(0); printf("%p", &x); putchar(0); printf("11"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    }

    printf("RETURN"); putchar(0); printf("x"); putchar(0); printf("%d", x); putchar(0); printf("%p", &x); putchar(0); printf("14"); putchar(0); printf("%d", __stack_depth); putchar('\n');
    __stack_depth--;
    return x;
}