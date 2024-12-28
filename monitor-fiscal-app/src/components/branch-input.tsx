import { useState, useEffect } from "react";
import axios from "axios";

export default function BranchInput() {
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `https://le0henr1que:7lpYv8JQJVULcgCo2oKvOLW032AQBq8oTxKjCoyB3PMszHVrSl8lJQQJ99ALACAAAAAACnHxAAAGAZDOUiE4@dev.azure.com/GrupoAvenida/Projeto%20-%20Engine%20Fiscal/_git/Var3.EngineFiscal/refs?filter=heads/&api-version=6.0`,
          {}
        );
        setBranches(
          response.data.value.map((branch: { name: string }) => branch.name)
        );
      } catch (err) {
        setError("Failed to load branches");
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  return (
    <div className="relative">
      <select
        value={selectedBranch}
        onChange={(e) => setSelectedBranch(e.target.value)}
        className="w-full p-3 border rounded-md"
      >
        <option value="" disabled>
          Select a branch...
        </option>
        {branches.map((branch) => (
          <option key={branch} value={branch}>
            {branch}
          </option>
        ))}
      </select>
      {loading && (
        <div className="absolute top-full left-0 mt-2 text-sm text-gray-500">
          Loading...
        </div>
      )}
      {error && (
        <div className="absolute top-full left-0 mt-2 text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
}
