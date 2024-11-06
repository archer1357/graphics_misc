// #define ERROR_MSG(X) fprintf(stderr,"Error : " X " : " __FILE__ ":%d\n",__LINE__)
// #define ERROR_MSG(X,...) fprintf(stderr,"Error : " X " : " __FILE__ ":%d\n" __VA_OPT__(,) __VA_ARGS__ , __LINE__)
#define ERROR_MSG(X,...) fprintf(stderr,"Error : " X " : " __FILE__ ":%d\n",##__VA_ARGS__,__LINE__)
