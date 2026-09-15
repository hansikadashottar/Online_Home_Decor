    package com.homedecor.onlinehomedecor.dto;

    public class OrderItemResponse {

        private Long orderItemId;
        private Long productId;
        private String productName;
        private Double price;
        private Integer quantity;
        private Double totalPrice;

        public OrderItemResponse() {
        }

        public OrderItemResponse(
                Long orderItemId,
                Long productId,
                String productName,
                Double price,
                Integer quantity,
                Double totalPrice) {

            this.orderItemId = orderItemId;
            this.productId = productId;
            this.productName = productName;
            this.price = price;
            this.quantity = quantity;
            this.totalPrice = totalPrice;
        }

        public Long getOrderItemId() {
            return orderItemId;
        }
        public void setOrderItemId(Long orderItemId) {
            this.orderItemId = orderItemId;
        }
        public Long getProductId() {
            return productId;
        }
        public void setProductId(Long productId) {
            this.productId = productId;
        }
        public String getProductName() {
            return productName;
        }
        public void setProductName(String productName) {
            this.productName = productName;
        }
        public Double getPrice() {
            return price;
        }
        public void setPrice(Double price) {
            this.price = price;
        }
        public Integer getQuantity() {
            return quantity;
        }
        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
        public Double getTotalPrice() {
            return totalPrice;
        }
        public void setTotalPrice(Double totalPrice) {
            this.totalPrice = totalPrice;
        }
    }