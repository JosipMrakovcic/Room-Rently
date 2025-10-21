package com.project.backend.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse {
    private String message;
    private boolean status;

    public void setMessage(String todoDeletedSuccessfully) {
        message = "";
        message = todoDeletedSuccessfully;
    }

    public void setStatus(boolean b) {
        status = b;
    }
}
