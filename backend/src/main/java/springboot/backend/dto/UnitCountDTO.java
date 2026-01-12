package springboot.backend.dto;

public record UnitCountDTO(
        Object label, // Promijenjeno iz identifier u label
        Long count,
        String image
) {}