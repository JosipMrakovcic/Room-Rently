package com.project.backend.controller;


import com.project.backend.model.ApiResponse;
import com.project.backend.model.Todo;
import com.project.backend.service.TodoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
//@RequestMapping("/api/todos")
@CrossOrigin(origins = "http://localhost:3000")


public class TodoController {
    private TodoService todoService;

    @Autowired
    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    @GetMapping("/api")
    public ApiResponse homeController(){
        ApiResponse res=new ApiResponse();
        res.setStatus(true);
        res.setMessage("Welcome to api");
        return res;
    }

    @GetMapping("/api/todos")
    public List<Todo> getAllTodos() {
        return todoService.getAllTodos();
    }

    @GetMapping("/api/todos/{id}")
    public Todo getTodoById(@PathVariable Long id) throws Exception {
        return todoService.getTodoById(id);
    }

    @PostMapping("/api/todos")
    public Todo createTodo(@RequestBody Todo todo) {
        return todoService.createTodo(todo);
    }

    /*@PutMapping("/api/todos/{id}")
    public Todo updateTodo(@PathVariable Long id, @RequestBody Todo todo) throws Exception {
        return todoService.updateTodo(id, todo);
    }*/


    @DeleteMapping("/api/todos/{id}")
    public ApiResponse deleteTodo(@PathVariable Long id) throws Exception {
        todoService.deleteTodo(id);
        ApiResponse res=new ApiResponse();
        res.setMessage("todo deleted successfully");
        res.setStatus(true);
        return res;
    }
}
