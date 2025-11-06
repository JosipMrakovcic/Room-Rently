package springboot.backend.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import springboot.backend.model.UnitImg;

@RepositoryRestResource(path = "unitImg")
public interface UnitImgRepo extends JpaRepository<UnitImg, String> {
}
