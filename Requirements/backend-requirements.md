# Airiam RAG Service - Backend Requirements

This document outlines the backend API requirements needed to support the Airiam RAG Service frontend application. The backend should be built using LlamaIndex, FastAPI, Weaviate, and a private LLM as specified.

## Technology Stack

- **LlamaIndex**: For RAG (Retrieval-Augmented Generation) capabilities
- **FastAPI**: For REST API implementation
- **Weaviate**: Vector database for storing and querying document embeddings
- **Private LLM**: For generating responses based on retrieved context

## API Endpoints

The frontend expects the following API endpoints:

### Authentication

```
POST /auth/login
POST /auth/register
GET /auth/me
POST /auth/logout
```

### Files Management

```
GET /files
GET /files/{id}
POST /files/upload
POST /files/cloud
PUT /files/{id}/tags
PUT /files/{id}/categories
DELETE /files/{id}
GET /tags
GET /categories
```

### Conversations

```
GET /conversations
GET /conversations/{id}
POST /conversations
POST /conversations/{id}/messages
DELETE /conversations/{id}
PUT /conversations/{id}/context
```

### Analytics

```
GET /analytics/usage-stats
GET /analytics/activity-log
GET /analytics/credit-consumption
GET /analytics/query-distribution
GET /analytics/top-documents
```

### Admin Endpoints

```
GET /tenants
GET /tenants/{id}
POST /tenants
PUT /tenants/{id}
DELETE /tenants/{id}
PUT /tenants/{id}/theme

GET /users
GET /users/{id}
POST /users
PUT /users/{id}
DELETE /users/{id}
```

## API Response Formats

The frontend expects the following response formats:

### User Object

```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "role": "admin|contributor|reviewer|viewer",
  "tenantId": "string"
}
```

### File Object

```json
{
  "id": "string",
  "name": "string",
  "size": "number",
  "type": "string",
  "uploadDate": "string",
  "lastModified": "string",
  "source": "upload|google-drive|onedrive|dropbox|sharepoint",
  "isExternal": "boolean",
  "externalId": "string",
  "externalUrl": "string",
  "thumbnailUrl": "string",
  "tags": [
    {
      "id": "string",
      "name": "string",
      "color": "string",
      "confidence": "number",
      "approved": "boolean",
      "createdBy": "string",
      "approvedBy": "string"
    }
  ],
  "categories": [
    {
      "id": "string",
      "name": "string",
      "color": "string"
    }
  ],
  "createdBy": "string",
  "status": "processing|indexed|error",
  "errorMessage": "string"
}
```

### Message Object

```json
{
  "id": "string",
  "conversationId": "string",
  "content": "string",
  "role": "user|assistant",
  "timestamp": "string",
  "sources": [
    {
      "fileId": "string",
      "fileName": "string",
      "snippet": "string",
      "page": "number"
    }
  ]
}
```

### Conversation Object

```json
{
  "id": "string",
  "title": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "messages": "Message[]",
  "fileContext": "string[]"
}
```

### Tenant Object

```json
{
  "id": "string",
  "name": "string",
  "domain": "string",
  "isActive": "boolean",
  "createdAt": "string",
  "updatedAt": "string",
  "theme": {
    "primaryColor": "string",
    "logoUrl": "string",
    "favicon": "string",
    "darkMode": "boolean"
  },
  "maxUsers": "number",
  "maxFiles": "number",
  "maxQueries": "number"
}
```

## Required Functionalities

### File Processing

1. **File Uploads**:
   - Support for various document types: PDF, DOCX, TXT, CSV, XLSX, etc.
   - Chunking/splitting of documents into appropriate segments
   - Extracting text content using OCR when needed

2. **Embedding Generation**:
   - Generate embeddings for document chunks
   - Store embeddings in Weaviate vector database

3. **Metadata Extraction**:
   - Extract metadata from documents (title, author, creation date, etc.)
   - AI-based tag suggestion for uploaded documents

4. **Cloud Integration**:
   - OAuth2 authentication with cloud providers (Google Drive, OneDrive, Dropbox, SharePoint)
   - API integration to list and access files from these providers
   - Option to index files in-place or download and store them

### Retrieval-Augmented Generation

1. **Query Understanding**:
   - Parse and understand user queries
   - Identify key concepts and intent

2. **Retrieval**:
   - Semantic search against the vector database
   - Filtering by file context when specified
   - Hybrid search (combining keyword and semantic search)

3. **Context Building**:
   - Select and arrange relevant document chunks
   - Track source information for attribution

4. **Generation**:
   - Prompt engineering for the private LLM
   - Streaming response generation
   - Source citation in responses

### Multi-tenancy

1. **Tenant Isolation**:
   - Data isolation between tenants
   - Tenant-specific configurations

2. **RBAC (Role-Based Access Control)**:
   - Implement user roles and permissions
   - Permission checking for all operations

### Analytics

1. **Usage Tracking**:
   - Track queries, file uploads, and API usage
   - Calculate token consumption

2. **Reporting**:
   - Generate usage reports and statistics
   - Track most accessed documents

## LlamaIndex Implementation

1. **Document Loading**:
   - Use LlamaIndex's document loaders for different file types
   - Implement custom loaders for unsupported formats

2. **Text Splitting**:
   - Configure appropriate chunking strategies (size, overlap)
   - Maintain document hierarchy when possible

3. **Vector Store Integration**:
   - Connect LlamaIndex to Weaviate
   - Implement metadata filtering

4. **Query Engine**:
   - Configure RAG pipeline with appropriate retrievers
   - Implement response synthesis with source attribution

## FastAPI Implementation

1. **API Structure**:
   - Organize endpoints by feature area
   - Implement proper status codes and error handling

2. **Authentication**:
   - JWT-based authentication
   - OAuth integration for social login

3. **File Handling**:
   - Implement multipart form data parsing
   - Handle large file uploads with streaming

4. **WebSockets**:
   - Implement WebSocket endpoints for streaming LLM responses
   - Handle connection management and error scenarios

## Weaviate Configuration

1. **Schema Design**:
   - Design classes for documents and chunks
   - Configure appropriate vector index settings

2. **Cross-References**:
   - Implement references between documents and chunks
   - Maintain tenant isolation in the schema

3. **Query Configuration**:
   - Configure BM25 for hybrid search
   - Set up proper filtering capabilities

## Private LLM Integration

1. **Model Deployment**:
   - Instructions for deploying the private LLM
   - Configuration for optimal performance

2. **Prompt Templates**:
   - Design effective prompt templates for RAG
   - Implement structured output parsing

3. **Inference Optimization**:
   - Batch processing where applicable
   - Caching strategies for repeated queries

## Security Requirements

1. **Authentication & Authorization**:
   - Secure JWT implementation
   - Proper permission checks

2. **Data Security**:
   - Encryption at rest and in transit
   - Secure handling of credentials

3. **Input Validation**:
   - Validate all API inputs
   - Prevent injection attacks

4. **Rate Limiting**:
   - Implement API rate limiting
   - Prevent abuse of expensive operations

## Deployment Considerations

1. **Containerization**:
   - Docker composition for all components
   - Environment configuration via environment variables

2. **Scaling**:
   - Stateless API design for horizontal scaling
   - Database connection pooling

3. **Monitoring**:
   - Logging and tracing setup
   - Performance monitoring points

4. **Backup & Recovery**:
   - Database backup strategy
   - Vector store snapshots

## Integration Points with Frontend

1. **API Contract**:
   - Maintain consistent API formats
   - Version API endpoints appropriately

2. **Authentication Flow**:
   - Support frontend authentication requirements
   - Handle token refresh properly

3. **File Operations**:
   - Support all file operations needed by frontend
   - Implement progress reporting for long operations

4. **Error Handling**:
   - Consistent error response format
   - Informative error messages

## Implementation Priorities

1. **Phase 1: Core RAG Functionality**
   - Basic authentication
   - File upload and processing
   - Basic conversation API
   - Simple retrieval and generation

2. **Phase 2: Enhanced Features**
   - Cloud storage integration
   - Advanced RAG capabilities
   - Tag and category management
   - Improved retrieval accuracy

3. **Phase 3: Enterprise Features**
   - Multi-tenancy
   - RBAC implementation
   - Analytics and reporting
   - Admin functionality

## Testing Requirements

1. **Unit Tests**
   - API endpoint testing
   - LlamaIndex component testing

2. **Integration Tests**
   - End-to-end RAG pipeline tests
   - File processing workflow tests

3. **Performance Tests**
   - Retrieval latency benchmarking
   - Generation throughput testing
   - Concurrent user simulation
