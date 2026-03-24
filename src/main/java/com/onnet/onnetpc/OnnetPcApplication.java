package com.onnet.onnetpc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class OnnetPcApplication {

	public static void main(String[] args) {
		SpringApplication.run(OnnetPcApplication.class, args);
	}

}
