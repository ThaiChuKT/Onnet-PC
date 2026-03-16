package com.onnet.onnetpc.pcs;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "pc_specs")
public class PcSpec {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "spec_name", nullable = false)
	private String specName;

	@Column(name = "cpu")
	private String cpu;

	@Column(name = "gpu")
	private String gpu;

	@Column(name = "ram")
	private Integer ram;

	@Column(name = "storage")
	private Integer storage;

	@Column(name = "os")
	private String os;

	@Column(name = "price_per_hour", nullable = false)
	private BigDecimal pricePerHour;

	@Column(name = "description")
	private String description;

	@Column(name = "is_exclusive")
	private Boolean exclusive;

	@Column(name = "is_available")
	private Boolean available;

	@Column(name = "created_at", insertable = false, updatable = false)
	private Instant createdAt;
}
