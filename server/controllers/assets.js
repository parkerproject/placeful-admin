// This is the assets controller. Goal is to serve css, js, partials, images, or bower packages.
module.exports = {
  partials: {
    handler: {
      directory: {
        path: './server/views/partials'
      }
    },
    app: {
      name: 'partials'
    }
  },
  images: {
    handler: {
      directory: {
        path: './public/images'
      }
    },
    app: {
      name: 'images'
    }
  },
  skins: {
    handler: {
      directory: {
        path: './public/skins'
      }
    },
    app: {
      name: 'skins'
    }
  },
  features: {
    handler: {
      directory: {
        path: './public/images/features'
      }
    },
    app: {
      name: 'skins'
    }
  },
  deal_images: {
    handler: {
      directory: {
        path: './deal_images'
      }
    },
    app: {
      name: 'images'
    }
  },
  css: {
    handler: {
      directory: {
        path: './public/css'
      }
    },
    app: {
      name: 'css'
    }
  },
  fonts: {
    handler: {
      directory: {
        path: './public/fonts'
      }
    },
    app: {
      name: 'fonts'
    }
  },
  js: {
    handler: {
      directory: {
        path: './public/js'
      }
    },
    app: {
      name: 'js'
    }
  },
  bower: {
    handler: {
      directory: {
        path: './public/bower_components'
      }
    },
    app: {
      name: 'bower'
    }
  },
  merchant: {
    handler: {
      directory: {
        path: './public/merchant'
      }
    },
    app: {
      name: 'merchant'
    }
  },
  assets: {
    handler: {
      directory: {
        path: './public/assets'
      }
    },
    app: {
      name: 'assets'
    }
  }
}