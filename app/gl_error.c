#include "gl_error.h"


bool checkGlError() {
    int errCode = glGetError();

    if(errCode==GL_INVALID_ENUM) {
        fprintf(stderr,"GL_INVALID_ENUM.\n");
    } else if(errCode==GL_INVALID_VALUE) {
        fprintf(stderr,"GL_INVALID_VALUE.\n");
    } else if(errCode==GL_INVALID_OPERATION) {
        fprintf(stderr,"GL_INVALID_OPERATION.\n");
    // } else if(errCode==GL_INVALID_FRAMEBUFFER_OPERATION) {
    //     fprintf(stderr,"GL_INVALID_FRAMEBUFFER_OPERATION.\n");
    } else if(errCode==GL_OUT_OF_MEMORY) {
        fprintf(stderr,"GL_OUT_OF_MEMORY.\n");
    } else if(errCode!=GL_NO_ERROR) {
    }

    return errCode==GL_NO_ERROR;
}

bool checkGlFboError() {
    // GLenum status = glCheckFramebufferStatus(GL_DRAW_FRAMEBUFFER);

    // if(status == GL_FRAMEBUFFER_COMPLETE) {
    //     return true;
    // }

    // if(n) {
    //     std::cerr << n  <<  ": ";
    // }

    // if(status==GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT) {
    //     fprintf(stderr,"GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT.\n");
    // } else if(status==GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT) {
    //     fprintf(stderr,"GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT.\n");
    // } else if(status==GL_FRAMEBUFFER_INCOMPLETE_DRAW_BUFFER) {
    //     fprintf(stderr,"GL_FRAMEBUFFER_INCOMPLETE_DRAW_BUFFER.\n");
    // } else if(status==GL_FRAMEBUFFER_INCOMPLETE_READ_BUFFER) {
    //     fprintf(stderr,"GL_FRAMEBUFFER_INCOMPLETE_READ_BUFFER.\n");
    // } else if(status==GL_FRAMEBUFFER_UNSUPPORTED) {
    //     fprintf(stderr,"GL_FRAMEBUFFER_UNSUPPORTED.\n");
    // }

    return false;
}
