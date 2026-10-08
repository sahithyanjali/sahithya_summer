import '../../models/volunteer_profile_model.dart';
import '../../models/opportunity_model.dart';

class MatchingResult {
  final int totalScore;
  final int skillsScore;
  final int availabilityScore;
  final int locationScore;
  final int experienceScore;
  final int preferenceScore;
  final List<String> reasons;

  MatchingResult({
    required this.totalScore,
    required this.skillsScore,
    required this.availabilityScore,
    required this.locationScore,
    required this.experienceScore,
    required this.preferenceScore,
    required this.reasons,
  });
}

class MatchingService {
  MatchingResult calculateMatch({
    required VolunteerProfileModel volunteer,
    required OpportunityModel opportunity,
  }) {
    // 1. Skill Match (Weight: 40 points)
    int skillsMatched = 0;
    for (final req in opportunity.skillsRequired) {
      if (volunteer.skills.contains(req)) skillsMatched++;
    }
    final double skillRatio = opportunity.skillsRequired.isEmpty 
        ? 1.0 
        : (skillsMatched / opportunity.skillsRequired.length);
    final int skillsScore = (skillRatio * 40).round();

    // 2. Availability Match (Weight: 20 points)
    final int availabilityScore = volunteer.availability.isNotEmpty ? 20 : 10;

    // 3. Location Match (Weight: 15 points)
    final bool locationMatch = opportunity.venue.toLowerCase().contains(volunteer.city.toLowerCase());
    final int locationScore = locationMatch ? 15 : 8;

    // 4. Experience Match (Weight: 10 points)
    final int experienceScore = volunteer.completedAssignmentsCount >= 5 
        ? 10 
        : (volunteer.completedAssignmentsCount * 2);

    // 5. Preference & Background Clearance (Weight: 15 points)
    final int preferenceScore = volunteer.backgroundCheckStatus == 'CLEARED' ? 15 : 5;

    final int totalScore = (skillsScore + availabilityScore + locationScore + experienceScore + preferenceScore)
        .clamp(0, 100);

    final List<String> reasons = [];
    if (skillsMatched > 0) {
      reasons.add('Matches $skillsMatched required skill(s) including "${opportunity.skillsRequired.first}"');
    }
    if (locationMatch) {
      reasons.add('Event is located within your registered zone (${volunteer.city})');
    }
    if (volunteer.backgroundCheckStatus == 'CLEARED') {
      reasons.add('Identity verified & background clearance on file');
    }

    return MatchingResult(
      totalScore: totalScore,
      skillsScore: skillsScore,
      availabilityScore: availabilityScore,
      locationScore: locationScore,
      experienceScore: experienceScore,
      preferenceScore: preferenceScore,
      reasons: reasons,
    );
  }
}
