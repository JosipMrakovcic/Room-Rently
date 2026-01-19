package org.example;

import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import java.time.Duration;
import java.util.Collections;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class AvailabilityTest {

    WebDriver driver;

    @BeforeEach
    void setup() {
        ChromeOptions options = new ChromeOptions();

        // novi profil dostupan samo Seleniumu
        // zamijeni usera stvarnim userom računala
        options.addArguments("--user-data-dir=C:\\Users\\User\\Desktop\\SeleniumProfile");

        // ovo maskira Selenium da ga Google ne prepozna kao bota
        options.addArguments("--disable-blink-features=AutomationControlled");
        options.setExperimentalOption("excludeSwitches", Collections.singletonList("enable-automation"));
        options.setExperimentalOption("useAutomationExtension", false);

        driver = new ChromeDriver(options);
        // Selenium će automatski čekati do 10 sekundi za svaki element u kodu
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
        driver.manage().window().maximize();
    }

    @AfterEach
    void teardown() {
        //driver.quit();
    }

    @Test
    @DisplayName("Rubni uvjet: Rezervacija smještaja zauzetog datuma")
    void testSuccessfulReservation() {
        driver.get("https://room-rently-v2.netlify.app");
        driver.findElement(By.tagName("button")).click();
        driver.findElement(By.cssSelector(".headerSearchItem:nth-child(2) > .headerSearchText")).click();

        // 17. dolazak
        driver.findElement(By.cssSelector(".rdrDay:nth-child(21) > .rdrDayNumber > span")).click();
        // 18. odlazak
        driver.findElement(By.cssSelector(".rdrDay:nth-child(22) > .rdrDayNumber > span")).click();

        driver.findElement(By.cssSelector(".headerBTN")).click();

        WebElement checkButton = driver.findElement(By.className("sicheckbutton"));
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", checkButton);

        driver.findElement(By.cssSelector(".booknow")).click();

        // provjera je li datum onemogućen
        WebElement zauzetiDan = driver.findElement(By.cssSelector(".rdrDay:nth-child(20)"));
        String klase = zauzetiDan.getAttribute("class");
        Assertions.assertTrue(klase.contains("rdrDayDisabled"), "Dan bi trebao biti zasivljen/onemogućen!");
    }
}
