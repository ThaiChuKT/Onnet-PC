package com.onnet.onnetpc.subscription;

import com.onnet.onnetpc.pcs.PcSpec;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "subscription_plans")
public class SubscriptionPlan {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "plan_name", nullable = false)
	private String planName;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "spec_id", nullable = false)
	private PcSpec spec;

	@Column(name = "duration_days", nullable = false)
	private Integer durationDays;

	@Column(name = "price", nullable = false)
	private BigDecimal price;

	@Column(name = "max_hours_per_day")
	private Integer maxHoursPerDay;

	@Column(name = "is_active")
	private Boolean active;

	@Column(name = "created_at", insertable = false, updatable = false)
	private Instant createdAt;
}
