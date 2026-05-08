package org.example.restaurantmanager.controller;

import org.example.restaurantmanager.model.RestaurantTable;
import org.example.restaurantmanager.repository.RestaurantTableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
@CrossOrigin(origins = "*")
public class RestaurantTableController {

    @Autowired
    private RestaurantTableRepository tableRepository;

    @GetMapping
    public ResponseEntity<Page<RestaurantTable>> getAllTables(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String keyword) {

        Pageable pageable = PageRequest.of(page, size);
        Page<RestaurantTable> tablePage;

        if (keyword != null && !keyword.trim().isEmpty()) {
            tablePage = tableRepository.findByTableNumberContainingIgnoreCase(keyword.trim(), pageable);
        } else {
            tablePage = tableRepository.findAll(pageable);
        }
        return ResponseEntity.ok(tablePage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantTable> getTableById(@PathVariable Long id) {
        return tableRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public RestaurantTable createTable(@RequestBody RestaurantTable table) {
        if (table.getStatus() == null || table.getStatus().isEmpty()) {
            table.setStatus("Empty");
        }
        return tableRepository.save(table);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RestaurantTable> updateTable(@PathVariable Long id, @RequestBody RestaurantTable tableDetails) {
        return tableRepository.findById(id).map(table -> {
            table.setTableNumber(tableDetails.getTableNumber());
            table.setStatus(tableDetails.getStatus());
            return ResponseEntity.ok(tableRepository.save(table));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTable(@PathVariable Long id) {
        return tableRepository.findById(id).map(table -> {
            tableRepository.delete(table);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}