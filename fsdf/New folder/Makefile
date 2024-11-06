MAKE_FILE=
ARCH=

ifeq ($(OS),Windows_NT)
	ifeq ($(PROCESSOR_ARCHITECTURE),AMD64)
		ARCH=AMD64
	endif

	ifeq ($(PROCESSOR_ARCHITECTURE),x86)
		ARCH=IA32
	endif

	MAKE_FILE=Makefile.w32
else
	UNAME_S := $(shell uname -s)
	UNAME_P := $(shell uname -p)

	ifeq ($(UNAME_P),x86_64)
		ARCH=AMD64
	endif

	ifneq ($(filter %86,$(UNAME_P)),)
		ARCH=IA32
	endif

	ifneq ($(filter arm%,$(UNAME_P)),)
		ARCH=ARM
	endif

	ifeq ($(UNAME_S),Linux)
		MAKE_FILE=Makefile.x11
	endif

	ifeq ($(UNAME_S),Darwin)
	endif
endif

.PHONY: all

all:
	make -f "$(MAKE_FILE)"
    

test:
	make -f "$(MAKE_FILE)" test

clean:
	make -f "$(MAKE_FILE)" clean
