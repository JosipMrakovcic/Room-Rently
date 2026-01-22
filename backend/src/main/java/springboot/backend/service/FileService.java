package springboot.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.*;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.util.List;

@Service
public class FileService {

    private final S3Client s3Client;
    private final String bucketName;
    private final String publicUrlPrefix;

    public FileService(
            @Value("${supabase.s3.access-key}") String accessKey,
            @Value("${supabase.s3.secret-key}") String secretKey,
            @Value("${supabase.s3.endpoint}") String endpoint,
            @Value("${supabase.s3.bucket}") String bucketName,
            @Value("${supabase.s3.region}") String region) {


        System.out.println("======= SSL TRUSTSTORE DEBUG =======");
        System.out.println("1. javax.net.ssl.trustStore: " + System.getProperty("javax.net.ssl.trustStore"));
        System.out.println("2. javax.net.ssl.trustStorePassword: " + (System.getProperty("javax.net.ssl.trustStorePassword") != null ? "*****" : "null"));

        String javaHome = System.getProperty("java.home");
        System.out.println("3. JAVA_HOME: " + javaHome);

        // Provjera uobičajenih lokacija za cacerts
        String[] possiblePaths = {
                System.getProperty("javax.net.ssl.trustStore"),
                javaHome + "/lib/security/cacerts",
                "/etc/ssl/certs/java/cacerts"
        };

        for (String path : possiblePaths) {
            if (path != null) {
                File f = new File(path);
                System.out.println("Provjera putanje [" + path + "]: Postoji=" + f.exists() + ", Čitljiv=" + f.canRead() + ", Veličina=" + f.length());
            }
        }
        System.out.println("====================================");


        System.out.println("======= S3 DEBUG CONFIGURATION =======");
        System.out.println("S3 ENDPOINT: " + endpoint);
        System.out.println("S3 REGION: " + region);
        System.out.println("S3 BUCKET: " + bucketName);
        System.out.println("S3 ACCESS KEY (prva 4): " + (accessKey != null ? accessKey.substring(0, 4) : "null"));
        System.out.println("======================================");

        // Forsiranje TLS protokola
        System.setProperty("https.protocols", "TLSv1.2,TLSv1.3");
        System.setProperty("jdk.tls.client.protocols", "TLSv1.2,TLSv1.3");

        this.bucketName = bucketName;
        this.publicUrlPrefix = endpoint.replace("/s3", "").replace("/object", "") + "/object/public/" + bucketName + "/";

        this.s3Client = S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .httpClientBuilder(UrlConnectionHttpClient.builder())
                .serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(true)
                        .build())
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .region(Region.of(region))
                .build();
    }

    public String upload(String path, MultipartFile file) throws IOException {
        System.out.println(">>> S3 POKUŠAJ UPLOADA: " + path + " na bucket " + bucketName);
        s3Client.putObject(PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(path)
                        .contentType(file.getContentType())
                        .build(),
                RequestBody.fromBytes(file.getBytes()));

        String finalUrl = publicUrlPrefix + path;
        System.out.println(">>> S3 UPLOAD USPJEŠAN. Javni URL: " + finalUrl);
        return finalUrl;
    }

    public void deleteFolder(String prefix) {
        // Osiguravamo da prefix ne počinje s / jer S3 to ne voli
        String cleanPrefix = prefix.startsWith("/") ? prefix.substring(1) : prefix;
        System.out.println(">>> S3 START BRISANJE FOLDERA (Prefix: " + cleanPrefix + ")");

        try {
            String continuationToken = null;
            int deletedCount = 0;

            do {
                ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                        .bucket(bucketName)
                        .prefix(cleanPrefix)
                        .continuationToken(continuationToken)
                        .build();

                ListObjectsV2Response listResponse = s3Client.listObjectsV2(listRequest);

                for (S3Object s3Object : listResponse.contents()) {
                    s3Client.deleteObject(DeleteObjectRequest.builder()
                            .bucket(bucketName)
                            .key(s3Object.key())
                            .build());
                    deletedCount++;
                    System.out.println(">>> S3 OBRISANO: " + s3Object.key());
                }

                continuationToken = listResponse.nextContinuationToken();
            } while (continuationToken != null);

            System.out.println(">>> S3 CLEANUP GOTOV. Ukupno obrisano objekata: " + deletedCount);

        } catch (Exception e) {
            System.err.println(">>> S3 ERROR pri brisanju foldera: " + e.getMessage());
        }
    }

    public List<S3Object> listAllObjects(String prefix) {
        System.out.println(">>> S3 POKUŠAJ LISTANJA OBJEKATA (Prefix: " + prefix + ")");
        try {
            ListObjectsV2Response response = s3Client.listObjectsV2(ListObjectsV2Request.builder()
                    .bucket(bucketName)
                    .prefix(prefix)
                    .build());
            System.out.println(">>> S3 LISTANJE USPJEŠNO. Pronađeno objekata: " + response.contents().size());
            return response.contents();
        } catch (Exception e) {
            System.err.println(">>> S3 LISTANJE NEUSPJEŠNO: " + e.getMessage());
            throw e;
        }
    }

    public void deleteFile(String url) {
        try {
            String key = url.replace(publicUrlPrefix, "");
            System.out.println(">>> S3 POKUŠAJ BRISANJA DATOTEKE: " + key);
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build());
        } catch (Exception e) {
            System.err.println(">>> S3 GREŠKA PRI BRISANJU: " + e.getMessage());
        }
    }

    public String moveFile(String oldUrl, String newKey) {
        try {
            String oldKey = oldUrl.replace(publicUrlPrefix, "");
            System.out.println(">>> S3 PREMJEŠTANJE: " + oldKey + " -> " + newKey);

            s3Client.copyObject(CopyObjectRequest.builder()
                    .sourceBucket(bucketName)
                    .sourceKey(oldKey)
                    .destinationBucket(bucketName)
                    .destinationKey(newKey)
                    .build());

            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(oldKey)
                    .build());

            return publicUrlPrefix + newKey;
        } catch (Exception e) {
            System.err.println(">>> S3 GREŠKA PRI PREMJEŠTANJU: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }
}