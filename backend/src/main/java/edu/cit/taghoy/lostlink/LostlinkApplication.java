package edu.cit.taghoy.lostlink;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class LostlinkApplication {

	public static void main(String[] args) {
		SpringApplication.run(LostlinkApplication.class, args);
	}

}
