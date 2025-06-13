#pragma once

#include <sstream>
/**
 * @brief Provides reusable utility functions
 *
 * This class provides multiple utility functions.
 */
class Utility {
public:
    /**
	 * @brief Gets the port from the environtment variable.
	 * @param filename The file contains the environment variable,
	 * default is ".env"
	 * @return The port number.
	 */
	static int read_port_from_env(const std::string& filename = ".env");
};