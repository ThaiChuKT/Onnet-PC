package com.onnet.onnetpc.moonlight.entity;

import com.onnet.onnetpc.users.User;
import com.onnet.onnetpc.pcs.Pc;
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
@Table(name = "sunshine_hosts")
public class SunshineHost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "host_address", nullable = false)
    private String hostAddress;

    @Column(name = "host_port", nullable = false)
    private Integer hostPort;

    @Column(name = "enabled")
    private Boolean enabled;

    @Column(name = "notes")
    private String notes;

    @Column(name = "paired_client_uuid")
    private String pairedClientUuid;

    @Column(name = "paired_client_name")
    private String pairedClientName;

    @Column(name = "paired_at")
    private Instant pairedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pc_id")
    private Pc pc;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;
}
