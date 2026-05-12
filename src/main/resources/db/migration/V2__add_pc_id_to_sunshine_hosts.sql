-- Migration: add pc_id to sunshine_hosts
ALTER TABLE sunshine_hosts
  ADD COLUMN pc_id BIGINT NULL;

ALTER TABLE sunshine_hosts
  ADD CONSTRAINT fk_sunshine_hosts_pc FOREIGN KEY (pc_id) REFERENCES pcs(id);
