const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
  };
};
// const convertDbObjectToResponseObject2 = (dbObject) => {
//     return{
//        districtId: dbObject.district_id,
//        districtName: dbObject.district_name,
//        stateId: dbObject.state_id,
//        cases: dbObject.cases,
//        cured: dbObject.cured,
//        active: dbObject.active,
//         deaths: dbObject.deaths,
//     };
    
// };

//1
app.get("/todos/", async (request, response) => {

    const { 
        status = "",
        priority = "",
        search_q = "",
        } = request.query;
  const getTodosQuery = `
    SELECT
      *
    FROM
     todo
    WHERE
     status LIKE '%${status}%'
     AND priority LIKE '%${priority}%'
     AND todo LIKE '%${search_q}%';`;
  const todosArray = await database.all(getTodosQuery);
  response.send(
    todosArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
     )
    // moviesArray
  );
});

// API 2 

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT 
      * 
    FROM 
      todo
    WHERE 
      id = ${todoId};`;
  const todo = await database.get(getTodoQuery);
  response.send(
      convertDbObjectToResponseObject(todo)
     );
     
});

// API 3 POST method

app.post("/todos/", async (request, response) => {
  const {id,todo,priority,status} = request.body;
  const postTodoQuery = `
  INSERT INTO
    todo (id, todo, priority, status)
  VALUES
    (
     ${id},
    '${todo}',
    '${priority}',
    '${status}'
      );`;
  const Todo = await database.run(postTodoQuery);
  response.send("Todo Successfully Added");

});

//API 4 PUT method

// app.put("/todos/:todoId/", async (request, response) => {
//   const { todoId } = request.params;
//   const todoDetails = request.body;
//   const {
//     status
//   } = todoDetails;
//   const updateTodoQuery = `UPDATE
//       todo
//     SET
//       status='${status}'
      
//     WHERE
//       id = ${todoId};`;
//   await database.run(updateTodoQuery);
//   response.send("Status Updated");
// });

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoDetails = request.body;
  const previousTodoQuery = `
  SELECT * FROM todo
  WHERE
    id = ${todoId};`;
    const previousTodo = await database.get(previousTodoQuery);

    const {
        todo = previousTodo.todo,
        priority = previousTodo.priority,
        status = previousTodo.status
    }= request.body;
  
  const updateTodoQuery = `UPDATE
      todo
    SET
       todo='${todo}',
       priority='${priority}',
       status='${status}'
      
    WHERE
      id = ${todoId};`;
  await database.run(updateTodoQuery);

  if(todoDetails.status===status){
        response.send("Status Updated");
  }else if(todoDetails.priority===priority){
        response.send("Priority Updated");
  }else if(todoDetails.todo === todo){
         response.send("Todo Updated");
  }
  
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM 
      todo
    WHERE
     id = ${todoId};`;
  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;

