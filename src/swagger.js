export default {
  openapi: '3.0.0',
  info: {
    title: 'Country Currency & Exchange API',
    version: '1.0.0',
    description: 'A RESTful API that fetches country data from external APIs, stores it in a PostgreSQL database, and provides CRUD operations with exchange rate calculations and GDP estimations.',
    contact: {
      name: 'API Support',
      email: 'support@example.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    },
    {
      url: 'https://your-production-url.com',
      description: 'Production server'
    }
  ],
  tags: [
    {
      name: 'Countries',
      description: 'Country data operations'
    },
    {
      name: 'Status',
      description: 'API status and statistics'
    }
  ],
  paths: {
    '/countries/refresh': {
      post: {
        tags: ['Countries'],
        summary: 'Refresh country data',
        description: 'Fetches latest country data and exchange rates from external APIs, computes GDP, and stores in database. Also generates a summary image.',
        responses: {
          200: {
            description: 'Countries data refreshed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Countries data refreshed successfully'
                    },
                    processed: {
                      type: 'integer',
                      example: 250
                    },
                    total: {
                      type: 'integer',
                      example: 250
                    }
                  }
                }
              }
            }
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          503: {
            description: 'External data source unavailable',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'External data source unavailable'
                    },
                    details: {
                      type: 'string',
                      example: 'Could not fetch data from REST Countries API'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/countries': {
      get: {
        tags: ['Countries'],
        summary: 'Get all countries',
        description: 'Retrieve all countries from the database with optional filters and sorting',
        parameters: [
          {
            name: 'region',
            in: 'query',
            description: 'Filter by region (e.g., Africa, Europe, Asia)',
            required: false,
            schema: {
              type: 'string',
              example: 'Africa'
            }
          },
          {
            name: 'currency',
            in: 'query',
            description: 'Filter by currency code (e.g., NGN, USD, EUR)',
            required: false,
            schema: {
              type: 'string',
              example: 'NGN'
            }
          },
          {
            name: 'sort',
            in: 'query',
            description: 'Sort results (gdp_desc for descending GDP)',
            required: false,
            schema: {
              type: 'string',
              enum: ['gdp_desc'],
              example: 'gdp_desc'
            }
          }
        ],
        responses: {
          200: {
            description: 'List of countries',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Country'
                  }
                }
              }
            }
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/countries/{name}': {
      get: {
        tags: ['Countries'],
        summary: 'Get a country by name',
        description: 'Retrieve a single country by its name (case-insensitive)',
        parameters: [
          {
            name: 'name',
            in: 'path',
            description: 'Country name',
            required: true,
            schema: {
              type: 'string',
              example: 'Nigeria'
            }
          }
        ],
        responses: {
          200: {
            description: 'Country found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Country'
                }
              }
            }
          },
          404: {
            description: 'Country not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Countries'],
        summary: 'Delete a country',
        description: 'Delete a country record by its name (case-insensitive)',
        parameters: [
          {
            name: 'name',
            in: 'path',
            description: 'Country name',
            required: true,
            schema: {
              type: 'string',
              example: 'Nigeria'
            }
          }
        ],
        responses: {
          200: {
            description: 'Country deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Country deleted successfully'
                    },
                    name: {
                      type: 'string',
                      example: 'Nigeria'
                    }
                  }
                }
              }
            }
          },
          404: {
            description: 'Country not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/status': {
      get: {
        tags: ['Status'],
        summary: 'Get API status',
        description: 'Get total number of countries and last refresh timestamp',
        responses: {
          200: {
            description: 'API status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    total_countries: {
                      type: 'integer',
                      example: 250
                    },
                    last_refreshed_at: {
                      type: 'string',
                      format: 'date-time',
                      example: '2025-10-22T18:00:00Z',
                      nullable: true
                    }
                  }
                }
              }
            }
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/countries/image': {
      get: {
        tags: ['Countries'],
        summary: 'Get summary image',
        description: 'Retrieve the generated summary image showing total countries, top 5 by GDP, and last refresh timestamp',
        responses: {
          200: {
            description: 'Summary image',
            content: {
              'image/png': {
                schema: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          },
          404: {
            description: 'Summary image not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Country: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          name: {
            type: 'string',
            example: 'Nigeria'
          },
          capital: {
            type: 'string',
            example: 'Abuja',
            nullable: true
          },
          region: {
            type: 'string',
            example: 'Africa',
            nullable: true
          },
          population: {
            type: 'integer',
            example: 206139589
          },
          currency_code: {
            type: 'string',
            example: 'NGN',
            nullable: true
          },
          exchange_rate: {
            type: 'number',
            format: 'decimal',
            example: 1600.23,
            nullable: true
          },
          estimated_gdp: {
            type: 'number',
            format: 'decimal',
            example: 25767448125.2,
            nullable: true
          },
          flag_url: {
            type: 'string',
            example: 'https://flagcdn.com/ng.svg',
            nullable: true
          },
          last_refreshed_at: {
            type: 'string',
            format: 'date-time',
            example: '2025-10-22T18:00:00Z',
            nullable: true
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Error message'
          },
          details: {
            type: 'string',
            example: 'Detailed error information'
          }
        }
      }
    }
  }
};
