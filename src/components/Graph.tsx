"use client";

import React, { useEffect, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  Node,
  applyNodeChanges,
  NodeChange,
} from "reactflow";

import "reactflow/dist/style.css";

import { seedNodes } from "../data/node";
import { seedEdges } from "../data/edges";

export default function Graph() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("graph");

    if (saved) {
      const parsed = JSON.parse(saved);
      setNodes(parsed.nodes);
      setEdges(parsed.edges);
    } else {
      setNodes(seedNodes);
      setEdges(seedEdges);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("graph", JSON.stringify({ nodes, edges }));
  }, [nodes, edges]);

  const onConnect = (params: Edge | Connection) =>
    setEdges((eds) =>
      addEdge(
        {
          ...params,
          label: "relates to",
        },
        eds,
      ),
    );

  const onNodeClick = (_: any, node: Node) => {
    setSelectedNode(node);
  };

  const updateTitle = (value: string) => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode.id
          ? { ...n, data: { ...n.data, label: value } }
          : n,
      ),
    );

    setSelectedNode({
      ...selectedNode,
      data: { ...selectedNode.data, label: value },
    });
  };

  const addNode = () => {
    const id = Date.now().toString();

    const newNode = {
      id,
      data: { label: "New Topic", note: "" },
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const updateNote = (value: string) => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode.id
          ? { ...n, data: { ...n.data, note: value } }
          : n,
      ),
    );

    setSelectedNode({
      ...selectedNode,
      data: { ...selectedNode.data, note: value },
    });
  };

  const deleteNode = () => {
    if (!selectedNode) return;

    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));

    setEdges((eds) =>
      eds.filter(
        (e) => e.source !== selectedNode.id && e.target !== selectedNode.id,
      ),
    );

    setSelectedNode(null);
  };

  const onEdgeClick = (_: any, edge: Edge) => {
    setEdges((eds) => eds.filter((e) => e.id !== edge.id));
  };

  const onNodesChange = (changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onNodesChange={onNodesChange}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>

      {selectedNode && (
        <div
          style={{
            position: "absolute",
            right: 20,
            top: 20,
            background: "white",
            padding: 20,
            border: "1px solid #ddd",
          }}
        >
          <h3>Edit Node</h3>

          <input
            value={selectedNode.data.label}
            onChange={(e) => updateTitle(e.target.value)}
          />
          <textarea
            value={selectedNode?.data?.note || ""}
            onChange={(e) => updateNote(e.target.value)}
            placeholder="Write note"
          />
          <button onClick={deleteNode}>Delete Node</button>
        </div>
      )}
      <button
        onClick={addNode}
        style={{
          position: "absolute",
          left: 20,
          top: 20,
          zIndex: 10,
        }}
      >
        Add Node
      </button>
    </div>
  );
}
