package com.thirdparty.user.request;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class RequestApplication {

	public static void main(String[] args) {
		SpringApplication.run(RequestApplication.class, args);
	}

}
