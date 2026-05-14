package com.onnet.onnetpc.moonlight.entity;

import com.onnet.onnetpc.booking.entity.Booking;
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
@Table(name = "moonlight_host_actions")
public class MoonlightHostAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id", nullable = false)
    private SunshineHost host;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by")
    private User requestedBy;

    @Column(name = "action_type", nullable = false)
    private String actionType;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "pin")
    private String pin;

    @Column(name = "request_source")
    private String requestSource;

    @Column(name = "request_note")
    private String requestNote;

    @Column(name = "result_text", columnDefinition = "longtext")
    private String resultText;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "processed_at")
    private Instant processedAt;
}