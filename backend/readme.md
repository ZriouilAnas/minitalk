# API Events

## Client to Server

auth:set-pseudo - Set user pseudo

message:send - Send a message

user:typing - Start typing indicator

user:stop-typing - Stop typing indicator

message:read - Mark message as read

## Server to Client

auth:require-pseudo - Request pseudo

auth:success - Pseudo accepted

auth:error - Authentication error

message:new - New message

users:update - Updated user list

user:typing - User typing status

user:joined - User joined

user:left - User left

message:read-receipt - Message read receipt

# Check if server is responding

curl http://localhost:3000/health
curl http://localhost:3000/info

# Connect to WebSocket

npm install -g wscat

# Connect

wscat -c ws://localhost:3000

# Send messages

{"type": "auth:set-pseudo", "pseudo": "testuser"}
