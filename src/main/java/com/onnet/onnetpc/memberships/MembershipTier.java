package com.onnet.onnetpc.memberships;

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
@Table(name = "membership_tiers")
public class MembershipTier {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "tier_name", nullable = false)
	private String tierName;

	@Column(name = "tier_level", nullable = false)
	private Integer tierLevel;

	@Column(name = "monthly_fee", nullable = false)
	private BigDecimal monthlyFee;

	@Column(name = "discount_percentage")
	private BigDecimal discountPercentage;

	@Column(name = "free_hours_per_month")
	private Integer freeHoursPerMonth;

	@Column(name = "advance_booking_days")
	private Integer advanceBookingDays;

	@Column(name = "support_level")
	private String supportLevel;

	@Column(name = "is_active")
	private Boolean active;

	@Column(name = "created_at", insertable = false, updatable = false)
	private Instant createdAt;
}
