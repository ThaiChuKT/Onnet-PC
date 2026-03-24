package com.onnet.onnetpc.booking.entity;

import com.onnet.onnetpc.booking.enums.BookingStatus;
import com.onnet.onnetpc.booking.enums.BookingType;
import com.onnet.onnetpc.pcs.Pc;
import com.onnet.onnetpc.pcs.PcSpec;
import com.onnet.onnetpc.users.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "bookings")
public class Booking {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "spec_id", nullable = false)
	private PcSpec spec;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "pc_id")
	private Pc pc;

	@Enumerated(EnumType.STRING)
	@Column(name = "booking_type", nullable = false)
	private BookingType bookingType;

	@Column(name = "total_hours")
	private Integer totalHours;

	@Column(name = "start_time", nullable = false)
	private Instant startTime;

	@Column(name = "end_time")
	private Instant endTime;

	@Column(name = "total_price")
	private BigDecimal totalPrice;

	@Enumerated(EnumType.STRING)
	@Column(name = "status")
	private BookingStatus status;

	@Column(name = "created_at", insertable = false, updatable = false)
	private Instant createdAt;

	@Column(name = "updated_at")
	private Instant updatedAt;
}
