INSERT INTO productos (marca_id, modelo, en_stock, fecha_lanzamiento, codigo_serie, precio) 
VALUES 
-- Productos DJI (marca_id = 1)
(1, 'Mavic 3 Pro', true, '2023-04-25', 'DJI-M3P-001', 2199.00),
(1, 'Mini 4 Pro', true, '2023-09-25', 'DJI-M4P-002', 759.00),
(1, 'Air 3', true, '2023-07-25', 'DJI-A3X-003', 1099.00),
(1, 'Avata 2', true, '2024-04-11', 'DJI-AV2-004', 999.00),
(1, 'Osmo Pocket 3', true, '2023-10-25', 'DJI-OP3-005', 519.00),

-- Productos GoPro (marca_id = 2)
(2, 'Hero 12 Black', true, '2023-09-13', 'GOP-H12-006', 399.99),
(2, 'Hero 11 Mini', true, '2022-10-25', 'GOP-H11-007', 299.99),
(2, 'Max 360', true, '2019-10-01', 'GOP-MAX-008', 499.99),
(2, 'Hero 10 Black', true, '2021-09-16', 'GOP-H10-009', 249.99),

-- Productos Sony (marca_id = 3)
(3, 'Alpha a7S III', true, '2020-07-28', 'SON-A7S-010', 3498.00),
(3, 'FX3 Cinema', true, '2021-02-23', 'SON-FX3-011', 3899.00),
(3, 'ZV-E1 Vlogging', true, '2023-03-29', 'SON-ZVE-012', 2198.00),

-- Productos Insta360 (marca_id = 4)
(4, 'X4 8K', true, '2024-04-16', 'INS-X4K-013', 499.99),
(4, 'Ace Pro', true, '2023-11-21', 'INS-ACE-014', 449.99),
(4, 'GO 3', true, '2023-06-27', 'INS-GO3-015', 399.99);