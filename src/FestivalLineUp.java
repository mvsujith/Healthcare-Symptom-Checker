package com.accolite.assignment;

import java.lang.*;
import java.util.*;

public class FestivalLineUp {
    public static List<String> findPerformanceOrder(List<List<String>> performance) {
        // Build graph: map from node to TreeMap of neighbors with counts
        Map<String, TreeMap<String, Integer>> graph = new HashMap<>();
        
        // Add all edges from the performance pairs
        for (List<String> pair : performance) {
            String u = pair.get(0);
            String v = pair.get(1);
            addEdge(graph, u, v);
            addEdge(graph, v, u);
        }
        
        // Stack for DFS-based Eulerian trail algorithm
        Stack<String> stack = new Stack<>();
        List<String> path = new ArrayList<>();
        stack.push("starter");
        
        while (!stack.isEmpty()) {
            String u = stack.peek();
            // If there are outgoing edges from u
            if (graph.containsKey(u) && !graph.get(u).isEmpty()) {
                // Get the smallest neighbor
                String v = graph.get(u).firstKey();
                // Remove the edge between u and v
                removeEdge(graph, u, v);
                stack.push(v);
            } else {
                // No more edges, pop and add to path
                stack.pop();
                path.add(u);
            }
        }
        
        // Reverse the path to get the correct order
        Collections.reverse(path);
        return path;
    }
    
    private static void addEdge(Map<String, TreeMap<String, Integer>> graph, String u, String v) {
        if (!graph.containsKey(u)) {
            graph.put(u, new TreeMap<>());
        }
        TreeMap<String, Integer> neighbors = graph.get(u);
        neighbors.put(v, neighbors.getOrDefault(v, 0) + 1);
    }
    
    private static void removeEdge(Map<String, TreeMap<String, Integer>> graph, String u, String v) {
        // Remove from u's neighbors
        if (graph.containsKey(u)) {
            TreeMap<String, Integer> neighborsU = graph.get(u);
            if (neighborsU.containsKey(v)) {
                int count = neighborsU.get(v);
                if (count == 1) {
                    neighborsU.remove(v);
                } else {
                    neighborsU.put(v, count - 1);
                }
            }
        }
        // Remove from v's neighbors
        if (graph.containsKey(v)) {
            TreeMap<String, Integer> neighborsV = graph.get(v);
            if (neighborsV.containsKey(u)) {
                int count = neighborsV.get(u);
                if (count == 1) {
                    neighborsV.remove(u);
                } else {
                    neighborsV.put(u, count - 1);
                }
            }
        }
    }
}