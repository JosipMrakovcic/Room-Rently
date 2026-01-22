package springboot.backend.dto;

public record UnitCountDTO(
        Object label,
        Long count,
        String image
) {}