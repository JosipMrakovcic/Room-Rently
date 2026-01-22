package springboot.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UnitFilterDTO {
    private Long idUnit;
    private String unitName;
    private Integer price;
    private Double averageRating;
    private String coverImage;
    private String location;
    private boolean apartment;
    private Integer numRooms;
    private Integer numBeds;
    private Integer capAdults;
    private Integer capChildren;
    private boolean hasWifi;
    private boolean hasParking;
    private boolean hasAirConditioning;
}