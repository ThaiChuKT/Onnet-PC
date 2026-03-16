package com.onnet.onnetpc.recommendation;

import com.onnet.onnetpc.pcs.PcSpec;
import com.onnet.onnetpc.users.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "ai_recommendations")
public class AiRecommendation {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "recommended_spec_id", nullable = false)
	private PcSpec recommendedSpec;

	@Column(name = "reason")
	private String reason;

	@Column(name = "created_at", insertable = false, updatable = false)
	private Instant createdAt;
}
