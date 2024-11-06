OUT = bin/test.exe

ifeq ($(OS),Windows_NT)
	CC = gcc
	RUN = ./$(OUT)
else
	CC = i686-w64-mingw32-cc 
	RUN = wine ./$(OUT)
endif

CPPFLAGS := -D_WIN32  -DWIN32
CFLAGS :=
LDFLAGS := -lgdi32 -lopengl32 -luser32 -static  

objs := $(patsubst %.c,$(dir $(OUT))%.o,$(wildcard *.c))
deps := $(objs:.o=.dep)

.PHONY: all test
all: $(OUT)

-include $(deps)

$(dir $(OUT))%.o: %.c
	@mkdir -p $(@D)
	$(CC) $(CPPFLAGS) $(CFLAGS) -c $< -o $@
	@$(CC) $(CPPFLAGS) -MM $< | sed -e '1,1 s|[^:]*:|$@:|' > $(@D)/$*.dep

$(OUT) : $(objs)
	$(CC) $^ $(LDFLAGS) -o $@

test: $(OUT)
	@$(RUN)

clean:
	@rm -f $(deps) $(objs) $(OUT)
	@rmdir --ignore-fail-on-non-empty $(dir $(OUT))
