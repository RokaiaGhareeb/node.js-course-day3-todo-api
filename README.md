# node.js-course-day3-todo-api
- todo api using .json file through lowdb package and express package


## End points 

post -- /api/register --> allow user to register by provied { usename, fname, password}  <br>
post -- /api/login --> allow user to log in by provied { usename, password}  <br><br>

get -- /api/todos --> return all users and thier todos <br>
get -- /api/todos/:username --> return all todos for specific username <br>
post -- /api/todos --> add new todos for specific username body {username, todos[{title, status}] } <br>
delete -- '/api/todos/:userId/:todoId' --> delete a todo <br>
patch -- '/api/todos/:userId/:todoId' --> edit todo body {[title], [status]} <br>

