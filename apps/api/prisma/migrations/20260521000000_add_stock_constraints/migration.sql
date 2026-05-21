-- Prevent negative stock at database level (last line of defence)
ALTER TABLE `Product`
  ADD CONSTRAINT `chk_stock_non_negative`
  CHECK (`currentStock` >= 0);

-- Prevent stock version from going backwards
ALTER TABLE `Product`
  ADD CONSTRAINT `chk_stock_version_positive`
  CHECK (`stockVersion` >= 0);

-- Prevent negative quantities on invoice items
ALTER TABLE `InvoiceItem`
  ADD CONSTRAINT `chk_item_qty_positive`
  CHECK (`quantity` > 0);
